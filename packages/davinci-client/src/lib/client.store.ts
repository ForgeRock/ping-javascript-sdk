/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, Result, Exit, Cause, Option } from 'effect';
import { type CustomLogger, logger as loggerFn, type LogLevel } from '@forgerock/sdk-logger';
import { createStorage } from '@forgerock/storage';
import { isGenericError, createWellknownError } from '@forgerock/sdk-utilities';

/**
 * Import RTK slices and api
 */
import {
  createClientStore,
  createInternalError,
  handleUpdateValidateError,
  isValidCollectorCategory,
} from './client.store.utils.js';
import { toSdkStore, type RootState } from './client.store.utils.js';
import { resolveCollectorUpdateValue } from './collector.validation.js';
import { pollingµ, getPollingModeµ, type PollingMode } from './client.store.effects.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { configSlice } from './config.slice.js';
import { wellknownApi } from '@forgerock/sdk-wellknown';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { SdkStore } from '@forgerock/sdk-types';
/**
 * Import the DaVinciRequest types
 */
import type { DaVinciConfig } from './config.types.js';
import type {
  DaVinciAction,
  DaVinciRequest,
  OutgoingQueryParams,
  StartOptions,
} from './davinci.types.js';
import type {
  SingleValueCollectors,
  ObjectValueCollectors,
  AutoCollectors,
  PollingCollector,
  MultiValueCollectors,
} from './collector.types.js';
import type {
  InitFlow,
  InternalErrorResponse,
  NodeStates,
  Updater,
  UpdatableCollectors,
  Validator,
  Poller,
  CollectorValueTypes,
} from './client.types.js';
import { returnValidator } from './collector.utils.js';
import { returnPasswordPolicyValidator } from './password-policy.rules.js';
import type { ContinueNode, StartNode } from './node.types.js';

/**
 * Create a client function that returns a set of methods
 * to interact with and normalize the DaVinci API.
 *
 * @function davinciClient - returns an "observable" client for DaVinci flows
 * @param {ConfigurationOptions} options - the configuration options for the client
 * @returns {Observable} - an observable client for DaVinci flows
 */
export async function davinci<ActionType extends ActionTypes = ActionTypes>({
  config,
  requestMiddleware,
  logger,
}: {
  config: DaVinciConfig;
  requestMiddleware?: RequestMiddleware<ActionType>[];
  logger?: {
    level: LogLevel;
    custom?: CustomLogger;
  };
}) {
  const log = loggerFn({
    level: logger?.level ?? config.log ?? 'error',
    custom: logger?.custom,
  });
  const injectable = createClientStore({ requestMiddleware, logger: log });
  const store = injectable.store;
  const serverInfo = createStorage<ContinueNode['server']>({
    type: 'localStorage',
    name: 'serverInfo',
  });
  if (!config.serverConfig.wellknown) {
    const error = new Error(
      '`wellknown` property is a required as part of the `config.serverConfig`',
    );
    log.error(error.message);
    throw error;
  }

  if (!config.clientId) {
    const error = new Error('`clientId` property is a required as part of the `config`');
    log.error(error.message);
    throw error;
  }

  const { data: openIdResponse, error: fetchError } = await store.dispatch(
    wellknownApi.endpoints.configuration.initiate(config.serverConfig.wellknown),
  );

  if (fetchError || !openIdResponse) {
    const genericError = createWellknownError(fetchError);
    log.error(`${genericError.error}: ${genericError.message}`);
    throw new Error(genericError.message);
  }

  store.dispatch(configSlice.actions.set({ ...config, wellknownResponse: openIdResponse }));

  return {
    // Opaque store handle — pass to oidc() to share this store
    store: toSdkStore(injectable) as SdkStore,
    // Pass store methods to the client
    subscribe: store.subscribe,

    /**
     * Social Login Handler
     * Use this as part of an event when clicking on
     * a social login button. Pass in the collector responsible
     * for the social login being started.
     *
     * This method will save the `continueUrl`
     * and then the app developer can use the url
     * from the collector to redirect their application
     *
     * Can return an error when no continue url is found
     * or no authenticate url is found in the collectors
     *
     * @method: externalIdp
     * @param collector IdpCollector
     * @returns {function}
     */
    externalIdp: (): (() => Promise<void | InternalErrorResponse>) => {
      const rootState: RootState = store.getState();
      const serverSlice = nodeSlice.selectors.selectServer(rootState);

      if (serverSlice && serverSlice.status === 'continue') {
        return async () => {
          const setResult = await serverInfo.set(serverSlice);
          if (isGenericError(setResult)) {
            log.error(setResult.message ?? setResult.error);
            return {
              error: {
                message: setResult.message ?? 'Failed to store server info for external IDP flow',
                type: 'internal_error',
              },
            } as InternalErrorResponse;
          }
          return;
        };
      }
      return async () => {
        return {
          error: {
            message:
              'Not in a continue node state, must be in a continue node to use external idp method',
            type: 'state_error',
          },
        } as InternalErrorResponse;
      };
    },

    /**
     * @method flow - Method for initiating a new flow, different than current flow
     * @param {DaVinciAction} action - the action to initiate the flow
     * @returns {function} - an async function to call the flow
     */
    flow: (action: DaVinciAction): InitFlow => {
      if (!action.action) {
        log.error('Missing `argument.action`');
        return async function () {
          return {
            error: { message: 'Missing argument.action', type: 'argument_error' },
            type: 'internal_error',
          };
        };
      }

      return async function () {
        await store.dispatch(davinciApi.endpoints.flow.initiate(action));
        const node = nodeSlice.selectSlice(store.getState());
        return node;
      };
    },

    /**
     * @method next - Method for initiating the next node in the current flow
     * @param {DaVinciRequest} args - the arguments to pass to the next
     * @returns {Promise} - a promise that resolves to the next node
     */
    next: async (args?: DaVinciRequest): Promise<NodeStates> => {
      const nodeCheck = nodeSlice.selectSlice(store.getState());
      if (nodeCheck.status === 'start') {
        return {
          ...nodeCheck,
          error: {
            status: 'error',
            type: 'state_error',
            message: 'Please use `start` before calling `next`',
          },
        } satisfies StartNode;
      }

      await store.dispatch(davinciApi.endpoints.next.initiate(args));
      const node = nodeSlice.selectSlice(store.getState());
      return node;
    },

    /**
     * @method: resume - Resume a social login flow when returned to application
     * @returns unknown
     */
    resume: async ({
      continueToken,
    }: {
      continueToken: string;
    }): Promise<InternalErrorResponse | NodeStates> => {
      try {
        const storedServerInfo = await serverInfo.get();

        if (storedServerInfo === null) {
          log.error('No server info found in storage for resume operation');
          return {
            error: {
              message:
                'No server info found in storage. Social login needs server info which is saved in local storage. You may have cleared your browser data.',
              type: 'state_error',
            },
            type: 'internal_error',
          };
        }

        if (isGenericError(storedServerInfo)) {
          log.error(storedServerInfo.message ?? storedServerInfo.error);
          return {
            error: {
              message:
                storedServerInfo.message ??
                'Failed to retrieve server info from storage for resume operation',
              type: 'internal_error',
            },
            type: 'internal_error',
          };
        }

        await store.dispatch(
          davinciApi.endpoints.resume.initiate({ continueToken, serverInfo: storedServerInfo }),
        );

        const removeResult = await serverInfo.remove();
        if (isGenericError(removeResult)) {
          log.warn(
            removeResult.message ?? 'Failed to remove server info from storage after resume',
          );
        }

        const node = nodeSlice.selectSlice(store.getState());

        return node;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log.error(errorMessage);
        return {
          error: {
            message: errorMessage || 'An unexpected error occurred during resume operation',
            type: 'internal_error',
          },
          type: 'internal_error',
        };
      }
    },

    /**
     * @method start - Method for initiating a DaVinci flow
     * @returns {Promise} - a promise that initiates a DaVinci flow and returns a node
     */
    start: async <QueryParams extends OutgoingQueryParams = OutgoingQueryParams>(
      options?: StartOptions<QueryParams> | undefined,
    ) => {
      await store.dispatch(davinciApi.endpoints.start.initiate(options));
      return store.getState().node;
    },

    /**
     * @method update - Exclusive method for updating the current node with user provided values
     * @param {UpdatableCollectors} collector - the collector to update
     * @returns {function} - a function to call for updating collector value
     */
    update: <T extends UpdatableCollectors>(collector: T): Updater<T> => {
      if (!collector) {
        return handleUpdateValidateError(
          'Argument for `collector` is required',
          'argument_error',
          log.error,
        );
      }

      if (!collector.id) {
        return handleUpdateValidateError(
          'Argument for `collector` has no ID',
          'argument_error',
          log.error,
        );
      }

      const { id } = collector;

      return function (value: CollectorValueTypes, index?: number) {
        const { error, state: collectorToUpdate } = nodeSlice.selectors.selectCollector(
          store.getState(),
          id,
        );

        if (error) {
          log.error(error.message);
          return createInternalError(error.message, 'state_error');
        }

        if (!collectorToUpdate) {
          log.error('Collector not found');
          return createInternalError('Collector not found', 'state_error');
        }

        if (
          !isValidCollectorCategory(collectorToUpdate, [
            'MultiValueCollector',
            'SingleValueCollector',
            'ValidatedSingleValueCollector',
            'ObjectValueCollector',
            'SingleValueAutoCollector',
            'ObjectValueAutoCollector',
          ])
        ) {
          log.error('Collector does not fall into a category that can be updated');
          return createInternalError(
            'Collector does not fall into a category that can be updated',
            'state_error',
          );
        }

        /**
         * Validate the collector value type
         *
         * `isValidCollectorCategory`'s `Extract<Collectors, { category: C }>` return type
         * structurally includes `SingleValueCollectorNoValue<'SingleValueCollector'>` — it
         * shares the same `category`/`type` literals as the real, updatable
         * `SingleValueCollectorWithValue` shape, so neither can be used to tell them apart.
         * No runtime factory in collector.utils.ts ever produces the `SingleValueCollectorNoValue`
         * shape, so the cast is safe.
         */
        const result = resolveCollectorUpdateValue(collectorToUpdate as UpdatableCollectors, value);
        if (Result.isFailure(result)) {
          log.error(result.failure.error.message);
          return result.failure;
        }

        // Update the collector in the store with the value
        store.dispatch(nodeSlice.actions.update({ id, value, index }));
        return null;
      };
    },

    /**
     * @method validate - Method for validating the value against validation rules
     * @param {SingleValueCollectors | ObjectValueCollectors | MultiValueCollectors | AutoCollectors} collector - the collector to validate
     * @returns {function} - a function to call for validating collector value
     * @throws {Error} - if the collector cannot be validated
     */
    validate: (
      collector:
        | SingleValueCollectors
        | ObjectValueCollectors
        | MultiValueCollectors
        | AutoCollectors,
    ): Validator => {
      if (!collector.id) {
        return handleUpdateValidateError(
          'Argument for `collector` has no ID',
          'argument_error',
          log.error,
        );
      }

      const { id } = collector;
      const { error, state: collectorToUpdate } = nodeSlice.selectors.selectCollector(
        store.getState(),
        id,
      );

      if (error) {
        return handleUpdateValidateError(error.message, 'state_error', log.error);
      }

      if (!collectorToUpdate) {
        return handleUpdateValidateError('Collector not found', 'state_error', log.error);
      }

      if (collectorToUpdate.type === 'PasswordCollector') {
        return handleUpdateValidateError(
          'PasswordCollector cannot be validated; pass a ValidatedPasswordCollector',
          'state_error',
          log.error,
        );
      }

      if (
        collectorToUpdate.type !== 'ValidatedPasswordCollector' &&
        !isValidCollectorCategory(collectorToUpdate, [
          'ValidatedSingleValueCollector',
          'ObjectValueCollector',
          'MultiValueCollector',
          'ObjectValueAutoCollector',
        ])
      ) {
        return handleUpdateValidateError(
          'Collector does not fall into a type or category that can be validated',
          'state_error',
          log.error,
        );
      }

      if (
        collectorToUpdate.type !== 'ValidatedPasswordCollector' &&
        !('validation' in collectorToUpdate.input)
      ) {
        return handleUpdateValidateError(
          'Collector has no validation rules',
          'state_error',
          log.error,
        );
      }

      if (collectorToUpdate.type === 'ValidatedPasswordCollector') {
        return returnPasswordPolicyValidator(collectorToUpdate);
      }

      return returnValidator(collectorToUpdate);
    },

    /**
     * @method pollStatus - A helper for challenge or continue polling
     * @description - In challenge polling mode, periodically polls the `/status` endpoint and returns a status.
     *                In continue polling mode, returns a polling status after a delay based on poll retries remaining.
     *                The polling mode is automatically detected.
     * @param {PollingCollector} collector - The polling collector
     * @returns {Promise<PollingStatus | InternalErrorResponse>} - Returns a promise that resolves to a polling status or error
     */
    pollStatus: (collector: PollingCollector): Poller => {
      return async () => {
        const result = await getPollingModeµ(collector).pipe(
          Effect.flatMap((mode: PollingMode) => pollingµ({ mode, collector, store, log })),
          Effect.tapError((err: InternalErrorResponse) =>
            Effect.sync(() => log.error(err.error.message)),
          ),
          Effect.runPromiseExit,
        );

        if (Exit.isSuccess(result)) {
          return result.value;
        }

        if (Exit.isFailure(result)) {
          const maybeError = Cause.findErrorOption(result.cause);
          if (Option.isSome(maybeError)) {
            return maybeError.value;
          }
        }

        return createInternalError(
          'An unexpected error occurred during poll operation',
          'unknown_error',
        );
      };
    },

    /**
     * @method client - Selector to get the node.client from state
     * @returns {Node.client} - the client property from the current node
     */
    getClient: () => nodeSlice.selectors.selectClient(store.getState()),

    /**
     * @method collectors - Selector to get the collectors from state
     * @returns {Collector[]} - The collectors from the current node in state
     */
    getCollectors: () => {
      const state = store.getState();
      const client = nodeSlice.selectors.selectClient(state);
      // Let's check if the node has a client and collectors
      if (client && 'collectors' in client) {
        const { error, state: collectors } = nodeSlice.selectors.selectCollectors(state) || [];
        if (error) {
          log.error(error.message);
          return [];
        }
        return collectors;
      }
      // Return an empty array if no client or collectors are found
      return [];
    },

    getError: () => {
      const state = store.getState();
      return nodeSlice.selectors.selectError(state);
    },

    getErrorCollectors: () => {
      const state = store.getState();
      const { error, state: collectors } = nodeSlice.selectors.selectErrorCollectors(state);
      if (error) {
        log.error(error.message);
        return [];
      }
      return collectors;
    },

    /**
     * @method node - Selector to get the node from state
     * @returns {Node} - the current node from state
     */
    getNode: () => {
      return nodeSlice.selectSlice(store.getState());
    },

    /**
     * @method server - Selector to get the node.server from state
     * @returns {Node.server} - the server property from the current node
     */
    getServer: () => {
      const state = store.getState();
      return nodeSlice.selectors.selectServer(state);
    },

    /**
     * Utilities to help query cached responses from server
     */
    cache: {
      getLatestResponse: () => {
        const node = nodeSlice.selectSlice(store.getState());

        if (!node.cache?.key) {
          log.error(`Cannot find current node's cache key or no current node`);
          return { error: { message: 'Cannot find current node', type: 'state_error' } };
        }

        const state = store.getState();
        const key = node.cache.key;

        const flowResult = davinciApi.endpoints.flow.select(key)(state);
        const nextResult = davinciApi.endpoints.next.select(key)(state);
        const startResult = davinciApi.endpoints.start.select(key)(state);

        if (flowResult.data !== undefined) return flowResult;
        if (nextResult.data !== undefined) return nextResult;
        if (startResult.data !== undefined) return startResult;

        return { error: { message: `No cache entry found for key: ${key}`, type: 'state_error' } };
      },
      getResponseWithId: (requestId: string) => {
        if (!requestId) {
          log.error('Please provide the cache key');
          return { error: { message: 'Please provide the cache key', type: 'argument_error' } };
        }

        const state = store.getState();

        const flowResult = davinciApi.endpoints.flow.select(requestId)(state);
        const nextResult = davinciApi.endpoints.next.select(requestId)(state);
        const startResult = davinciApi.endpoints.start.select(requestId)(state);

        if (flowResult.data !== undefined) return flowResult;
        if (nextResult.data !== undefined) return nextResult;
        if (startResult.data !== undefined) return startResult;

        return {
          error: {
            message: `No cache entry found for request ID: ${requestId}`,
            type: 'state_error',
          },
        };
      },
    },
  };
}
