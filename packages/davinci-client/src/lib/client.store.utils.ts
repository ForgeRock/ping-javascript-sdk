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
import type { GenericError } from '@forgerock/sdk-types';
import { isGenericError } from '@forgerock/sdk-utilities';

import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { ErrorNode, ContinueNode, StartNode, SuccessNode } from '../types.js';
import { wellknownApi } from './wellknown.api.js';
import type { InternalErrorResponse, PollingStatus } from './client.types.js';
import type { PollingCollector } from './collector.types.js';

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

/**
 * Discriminated union representing the validated polling mode.
 */
export type PollingMode =
  | { _tag: 'challenge'; challenge: string }
  | { _tag: 'continue'; retriesRemaining: number; pollInterval: number };

function internalError(
  message: string,
  type: GenericError['type'] = 'internal_error',
): InternalErrorResponse {
  return { error: { message, type }, type: 'internal_error' };
}

export function determinePollingMode(collector: PollingCollector): PollingMode {
  if (collector.type !== 'PollingCollector') {
    throw internalError('Collector provided to poll is not a PollingCollector', 'argument_error');
  }

  const { pollChallengeStatus, challenge, retriesRemaining, pollInterval } =
    collector.output.config;

  if (challenge && pollChallengeStatus === true) {
    return { _tag: 'challenge', challenge };
  }

  if (!challenge && !pollChallengeStatus) {
    if (retriesRemaining === undefined) {
      throw internalError('No retries found on PollingCollector', 'argument_error');
    }
    return { _tag: 'continue', retriesRemaining, pollInterval: pollInterval ?? 2000 };
  }

  throw internalError('Invalid polling collector configuration');
}

/**
 * Shape returned by RTK Query's dispatch for the poll endpoint.
 */
export interface PollDispatchResult {
  data?: unknown;
  error?: { message?: string; status?: number | string; data?: unknown };
}

/**
 * Validated prerequisites needed to initiate challenge polling.
 */
interface PollingPrerequisites {
  interactionId: string;
  challengeEndpoint: string;
}

/**
 * Selects and validates server is in continue state from root state.
 * Narrows from the NodeStates server union to ContinueNode['server'].
 * Throws InternalErrorResponse on validation failure.
 */
function selectContinueServer(rootState: RootState): ContinueNode['server'] {
  const server = nodeSlice.selectors.selectServer(rootState);

  if (server === null) {
    throw internalError('No server info found for poll operation', 'state_error');
  }

  if (isGenericError(server)) {
    throw internalError(server.message ?? 'Failed to retrieve server info for poll operation');
  }

  if (server.status !== 'continue') {
    throw internalError(
      'Not in a continue node state, must be in a continue node to use poll method',
      'state_error',
    );
  }

  return server;
}

/**
 * Extracts the self link href from server links.
 * Throws InternalErrorResponse if self link is missing.
 */
function selectSelfLink(server: ContinueNode['server']): string {
  const links = server._links;
  if (!links || !('self' in links) || !('href' in links['self']) || !links['self'].href) {
    throw internalError('No self link found in server info for challenge polling operation');
  }
  return links['self'].href;
}

/**
 * Constructs the challenge polling endpoint from a self link URL.
 * Throws InternalErrorResponse if URL cannot be parsed.
 */
function buildChallengeEndpoint(selfHref: string, challenge: string): string {
  const url = new URL(selfHref);
  const envId = url.pathname.split('/')[1];

  if (!url.origin || !envId) {
    throw internalError(
      'Failed to construct challenge polling endpoint. Requires host and environment ID.',
      'parse_error',
    );
  }

  return `${url.origin}/${envId}/davinci/user/credentials/challenge/${challenge}/status`;
}

/**
 * Pure function: validates all prerequisites for challenge polling and constructs the endpoint URL.
 * Composes selectors that each extract and validate a piece of state.
 * Throws InternalErrorResponse on any validation failure — designed to be caught by Micro.try.
 */
export function validatePollingPrerequisites(
  rootState: RootState,
  challenge: string,
): PollingPrerequisites {
  if (!challenge) {
    throw internalError('No challenge found on collector for poll operation', 'state_error');
  }
  const server = selectContinueServer(rootState);
  const selfHref = selectSelfLink(server);
  const challengeEndpoint = buildChallengeEndpoint(selfHref, challenge);

  if (!server.interactionId) {
    throw internalError('Missing interactionId in server info for challenge polling');
  }

  return { interactionId: server.interactionId, challengeEndpoint };
}

/**
 * Pure predicate: determines if challenge polling should continue.
 * Returns true when the challenge has not yet completed and no error occurred.
 */
export function isChallengeStillPending(response: PollDispatchResult): boolean {
  if (response.error) return false;

  const data = response.data as Record<string, unknown> | undefined;
  if (data?.['isChallengeComplete']) return false;

  return true;
}

export function interpretChallengeResponse(
  response: PollDispatchResult,
): Micro.Micro<PollingStatus, InternalErrorResponse> {
  const { data, error } = response;

  if (error) {
    // FetchBaseQueryError — has status field
    if ('status' in error) {
      const errorDetails = error.data as Record<string, unknown> | undefined;
      const serviceName = errorDetails?.['serviceName'];

      // Expired challenge is an expected polling outcome, not a failure
      if (error.status === 400 && serviceName === 'challengeExpired') {
        return Micro.succeed('expired');
      }

      // Other HTTP errors are also expected outcomes (e.g. bad challenge returning 400 with code 4019)
      return Micro.succeed('error');
    }

    // SerializedError — has message field
    const message =
      'message' in error && error.message
        ? error.message
        : 'An unknown error occurred while challenge polling';

    return Micro.fail(internalError(message, 'unknown_error'));
  }

  const pollResponse = data as Record<string, unknown> | undefined;

  // Challenge completed — extract status
  if (pollResponse?.['isChallengeComplete'] === true) {
    const pollStatus = pollResponse['status'];
    return pollStatus
      ? Micro.succeed(pollStatus as PollingStatus)
      : Micro.succeed('error' as PollingStatus);
  }

  // If we reach here, Micro.repeat exhausted its schedule without the challenge completing
  return Micro.succeed('timedOut');
}

/**
 * Orchestrates challenge polling using extracted pure functions.
 * The shell: reads state, dispatches effects, runs the pipeline at the boundary.
 */
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
  const maxRetries = collector.output.config.pollRetries ?? 60;
  const pollInterval = collector.output.config.pollInterval ?? 2000;

  // validate → query → repeat → interpret
  const challengePollµ = Micro.try({
    try: () => validatePollingPrerequisites(store.getState(), challenge),
    catch: (error) => error as InternalErrorResponse,
  }).pipe(
    Micro.flatMap(({ interactionId, challengeEndpoint }) =>
      Micro.promise(() =>
        store.dispatch(
          davinciApi.endpoints.poll.initiate({
            endpoint: challengeEndpoint,
            interactionId,
          }),
        ),
      ).pipe(
        Micro.repeat({
          while: isChallengeStillPending,
          times: maxRetries,
          schedule: Micro.scheduleSpaced(pollInterval),
        }),
      ),
    ),
    Micro.flatMap(interpretChallengeResponse),
    Micro.tapError(({ error }) => Micro.sync(() => log.error(error.message))),
  );

  const result = await Micro.runPromiseExit(challengePollµ);

  if (exitIsSuccess(result)) {
    return result.value;
  } else if (exitIsFail(result)) {
    return result.cause.error;
  }

  return {
    error: { message: result.cause.message, type: 'unknown_error' },
    type: 'internal_error',
  };
}
