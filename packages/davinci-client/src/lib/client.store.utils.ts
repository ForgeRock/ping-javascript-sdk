/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { configureStore } from '@reduxjs/toolkit';
import { Micro } from 'effect';
import { exitIsSuccess, exitIsFail } from 'effect/Micro';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';
import { isGenericError } from '@forgerock/sdk-utilities';

import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { ErrorNode, ContinueNode, StartNode, SuccessNode } from '../types.js';
import { wellknownApi } from './wellknown.api.js';
import type { InternalErrorResponse, PollingStatus } from './client.types.js';
import { PollingCollector } from './collector.types.js';

export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}) {
  return configureStore({
    reducer: {
      config: configSlice.reducer,
      node: nodeSlice.reducer,
      [davinciApi.reducerPath]: davinciApi.reducer,
      [wellknownApi.reducerPath]: wellknownApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            /**
             * This becomes the `api.extra` argument, and will be passed into the
             * customer query wrapper for `baseQuery`
             */
            requestMiddleware,
            logger,
          },
        },
      })
        .concat(davinciApi.middleware)
        .concat(wellknownApi.middleware),
  });
}

export function handleUpdateValidateError(
  message: string,
  type: 'argument_error' | 'state_error',
  cb: (message: string) => void,
): () => InternalErrorResponse {
  cb(message);
  return function () {
    return {
      error: {
        message: message,
        type: type,
      },
      type: 'internal_error' as const,
    };
  };
}

type ClientStore = typeof createClientStore;

export type RootState = ReturnType<ReturnType<ClientStore>['getState']>;

export interface RootStateWithNode<T extends ErrorNode | ContinueNode | StartNode | SuccessNode>
  extends RootState {
  node: T;
}

export type AppDispatch = ReturnType<ReturnType<ClientStore>['dispatch']>;

export async function handleChallengePolling({
  collector,
  challenge,
  store,
  log,
}: {
  collector: PollingCollector;
  challenge: string;
  store: ReturnType<ClientStore>;
  log: ReturnType<typeof loggerFn>;
}): Promise<PollingStatus | InternalErrorResponse> {
  if (!challenge) {
    log.error('No challenge found on collector for poll operation');
    return {
      error: {
        message: 'No challenge found on collector for poll operation',
        type: 'state_error',
      },
      type: 'internal_error',
    };
  }

  const rootState: RootState = store.getState();
  const serverSlice = nodeSlice.selectors.selectServer(rootState);

  if (serverSlice === null) {
    log.error('No server info found for poll operation');
    return {
      error: {
        message: 'No server info found for poll operation',
        type: 'state_error',
      },
      type: 'internal_error',
    };
  }

  if (isGenericError(serverSlice)) {
    log.error(serverSlice.message ?? serverSlice.error);
    return {
      error: {
        message: serverSlice.message ?? 'Failed to retrieve server info for poll operation',
        type: 'internal_error',
      },
      type: 'internal_error',
    };
  }

  if (serverSlice.status !== 'continue') {
    return {
      error: {
        message: 'Not in a continue node state, must be in a continue node to use poll method',
        type: 'state_error',
      },
    } as InternalErrorResponse;
  }

  // Construct the challenge polling endpoint
  const links = serverSlice._links;
  if (!links || !('self' in links) || !('href' in links['self']) || !links['self'].href) {
    return {
      error: {
        message: 'No self link found in server info for challenge polling operation',
        type: 'internal_error',
      },
    } as InternalErrorResponse;
  }

  const selfUrl = links['self'].href;
  const url = new URL(selfUrl);
  const baseUrl = url.origin;
  const paths = url.pathname.split('/');
  const envId = paths[1];

  if (!baseUrl || !envId) {
    return {
      error: {
        message:
          'Failed to construct challenge polling endpoint. Requires host and environment ID.',
        type: 'parse_error',
      },
    } as InternalErrorResponse;
  }

  const interactionId = serverSlice.interactionId;
  if (!interactionId) {
    return {
      error: {
        message: 'Missing interactionId in server info for challenge polling',
        type: 'internal_error',
      },
    } as InternalErrorResponse;
  }

  const challengeEndpoint = `${baseUrl}/${envId}/davinci/user/credentials/challenge/${challenge}/status`;

  // Start challenge polling
  let retriesLeft = collector.output.config.pollRetries ?? 60;
  const pollInterval = collector.output.config.pollInterval ?? 2000; // miliseconds

  const queryµ = Micro.promise(() => {
    retriesLeft--;
    return store.dispatch(
      davinciApi.endpoints.poll.initiate({
        endpoint: challengeEndpoint,
        interactionId,
      }),
    );
  });

  const challengePollµ = Micro.repeat(queryµ, {
    while: ({ data, error }) =>
      retriesLeft > 0 && !error && !(data as Record<string, unknown>)['isChallengeComplete'],
    schedule: Micro.scheduleSpaced(pollInterval),
  }).pipe(
    Micro.flatMap(({ data, error }) => {
      const pollResponse = data as Record<string, unknown>;

      // Check for any errors and return the appropriate status
      if (error) {
        // SerializedError
        let message = 'An unknown error occurred while challenge polling';
        if ('message' in error && error.message) {
          message = error.message;
          return Micro.fail({
            error: {
              message,
              type: 'unknown_error',
            },
            type: 'internal_error',
          } as InternalErrorResponse);
        }

        // FetchBaseQueryError
        let status: number | string = 'unknown';
        if ('status' in error) {
          status = error.status;

          const errorDetails = error.data as Record<string, unknown>;
          const serviceName = errorDetails['serviceName'];

          // Check for an expired challenge
          if (status === 400 && serviceName && serviceName === 'challengeExpired') {
            log.debug('Challenge expired for polling');
            return Micro.succeed('expired' as PollingStatus);
          } else {
            // If we're here there is some other type of network error and status != 200
            // e.g. A bad challenge can return a httpStatus of 400 with code 4019
            log.debug('Network error occurred during polling');
            return Micro.succeed('error' as PollingStatus);
          }
        }
      }

      // If a successful response is recieved it can be either a timeout or true success
      if (pollResponse['isChallengeComplete'] === true) {
        const pollStatus = pollResponse['status'];
        if (!pollStatus) {
          return Micro.succeed('error' as PollingStatus);
        } else {
          return Micro.succeed(pollStatus as PollingStatus);
        }
      } else if (retriesLeft <= 0 && !pollResponse['isChallengeComplete']) {
        return Micro.succeed('timedOut' as PollingStatus);
      }

      // Just in case no polling status was determined
      return Micro.fail({
        error: {
          message: 'Unknown error occurred during polling',
          type: 'unknown_error',
        },
        type: 'internal_error',
      } as InternalErrorResponse);
    }),
  );

  const result = await Micro.runPromiseExit(challengePollµ);

  if (exitIsSuccess(result)) {
    return result.value;
  } else if (exitIsFail(result)) {
    return result.cause.error;
  } else {
    return {
      error: {
        message: result.cause.message,
        type: 'unknown_error',
      },
      type: 'internal_error',
    };
  }
}
