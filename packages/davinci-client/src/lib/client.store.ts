/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import RTK slices and api
 */
import { createClientStore, RootState } from './client.store.utils.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { configSlice } from './config.slice.js';
import { wellknownApi } from './wellknown.api.js';

import type { ActionTypes, RequestMiddleware } from '@forgerock/effects/types';
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
  IdpCollector,
  MultiSelectCollector,
} from './collector.types.js';
import type { InitFlow, Updater, Validator } from './client.types.js';
import { returnValidator } from './collector.utils.js';
import { authorize } from './davinci.utils.js';

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
}: {
  config: DaVinciConfig;
  requestMiddleware?: RequestMiddleware<ActionType>[];
}) {
  const store = createClientStore({ requestMiddleware });

  if (!config.serverConfig.wellknown) {
    throw new Error('`wellknown` property is a required as part of the `config.serverOptions`');
  }

  if (!config.clientId) {
    throw new Error('`clientId` property is a required as part of the `config`');
  }

  const { data: openIdResponse } = await store.dispatch(
    wellknownApi.endpoints.wellknown.initiate(config.serverConfig.wellknown),
  );

  if (!openIdResponse) {
    throw new Error('error fetching `wellknown` response for OpenId Configuration');
  }

  store.dispatch(configSlice.actions.set({ ...config, wellknownResponse: openIdResponse }));

  return {
    // Pass store methods to the client
    subscribe: store.subscribe,

    /**
     * Social Login Handler
     * Use this as part of an event when clicking on
     * a social login button. Pass in the collector responsible
     * for the social login being started.
     *
     * This method will save the `continueUrl`
     * and then replace the window with the authenticate
     * url from the collector
     *
     * Can return an error when no continue url is found
     * or no authenticate url is found in the collectors
     *
     * @method: externalIdp
     * @param collector IdpCollector
     * @returns {function}
     */
    externalIdp: (collector: IdpCollector) => {
      const rootState: RootState = store.getState();

      const serverSlice = nodeSlice.selectors.selectServer(rootState);

      return () => authorize(serverSlice, collector);
    },

    /**
     * @method flow - Method for initiating a new flow, different than current flow
     * @param {DaVinciAction} action - the action to initiate the flow
     * @returns {function} - an async function to call the flow
     */
    flow: (action: DaVinciAction): InitFlow => {
      if (!action.action) {
        console.error('Missing `argument.action`');
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
    next: async (args?: DaVinciRequest) => {
      const nodeCheck = nodeSlice.selectSlice(store.getState());
      if (nodeCheck.status === 'start') {
        return {
          ...nodeCheck,
          error: 'Please use `start` before calling `next`',
        };
      }

      await store.dispatch(davinciApi.endpoints.next.initiate(args));
      const node = nodeSlice.selectSlice(store.getState());
      return node;
    },

    /**
     * @method: resume - Resume a social login flow when returned to application
     * @returns unknown
     */
    resume: async ({ continueToken }: { continueToken: string }) => {
      await store.dispatch(davinciApi.endpoints.resume.initiate({ continueToken }));

      const node = nodeSlice.selectSlice(store.getState());

      return node;
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
     * @param {SingleValueCollector} collector - the collector to update
     * @returns {function} - a function to call for updating collector value
     */
    update: (collector: SingleValueCollectors | MultiSelectCollector): Updater => {
      if (!collector.id) {
        console.error('Argument for `collector` has no ID');
        return function () {
          return {
            error: {
              message: 'Argument for `collector` has no ID',
              type: 'argument_error' as const,
            },
            type: 'internal_error' as const,
          };
        };
      }

      const { id } = collector;
      const collectorToUpdate = nodeSlice.selectors.selectCollector(store.getState(), id);

      if (!collectorToUpdate) {
        return function () {
          console.error('Collector not found');
          return {
            type: 'internal_error' as const,
            error: { message: 'Collector not found', type: 'state_error' as const },
          };
        };
      }

      if (
        collectorToUpdate.category !== 'MultiValueCollector' &&
        collectorToUpdate.category !== 'SingleValueCollector' &&
        collectorToUpdate.category !== 'ValidatedSingleValueCollector'
      ) {
        console.error(
          'Collector is not a MultiValueCollector, SingleValueCollector or ValidatedSingleValueCollector and cannot be updated',
        );
        return function () {
          return {
            type: 'internal_error',
            error: {
              message:
                'Collector is not a SingleValueCollector or ValidatedSingleValueCollector and cannot be updated',
              type: 'state_error',
            },
          } as const;
        };
      }

      return function (value: string | string[], index?: number) {
        try {
          store.dispatch(nodeSlice.actions.update({ id, value, index }));
          return null;
        } catch (err) {
          const error = err as Error;
          return {
            type: 'internal_error',
            error: { message: error.message, type: 'internal_error' },
          };
        }
      };
    },

    /**
     * @method validate - Method for validating the value against validation rules
     * @param {SingleValueCollector} collector - the collector to validate
     * @returns {function} - a function to call for validating collector value
     * @throws {Error} - if the collector is not a SingleValueCollector
     */
    validate: (collector: SingleValueCollectors): Validator => {
      if (!collector.id) {
        console.error('Argument for `collector` has no ID');
        return function () {
          return {
            error: { message: 'Argument for `collector` has no ID', type: 'argument_error' },
            type: 'internal_error',
          };
        };
      }

      const { id } = collector;
      const collectorToUpdate = nodeSlice.selectors.selectCollector(store.getState(), id);

      if (!collectorToUpdate) {
        return function () {
          console.error('Collector not found');
          return {
            type: 'internal_error',
            error: { message: 'Collector not found', type: 'state_error' },
          };
        };
      }

      if (collectorToUpdate.category !== 'ValidatedSingleValueCollector') {
        console.error('Collector is not a SingleValueCollector and cannot be validated');
        return function () {
          return {
            type: 'internal_error',
            error: {
              message: 'Collector is not a SingleValueCollector and cannot be validated',
              type: 'state_error',
            },
          };
        };
      }

      if (!('validation' in collectorToUpdate.input)) {
        console.error('Collector has no validation rules');
        return function () {
          return {
            type: 'internal_error',
            error: { message: 'Collector has no validation rules', type: 'state_error' },
          };
        };
      }

      return returnValidator(collectorToUpdate);
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
        return nodeSlice.selectors.selectCollectors(state) || [];
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
      return nodeSlice.selectors.selectErrorCollectors(state);
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
          console.error(`Cannot find current node's cache key or no current node`);
          return { error: { message: 'Cannot find current node', type: 'state_error' } };
        }

        const flowItem = davinciApi.endpoints.flow.select(node.cache.key);
        const nextItem = davinciApi.endpoints.next.select(node.cache.key);
        const startItem = davinciApi.endpoints.start.select(node.cache.key);

        return flowItem || nextItem || startItem;
      },
      getResponseWithId: (requestId: string) => {
        if (!requestId) {
          console.error('Please provide the cache key');
          return { error: { message: 'Please provide the cache key', type: 'argument_error' } };
        }

        const flowItem = davinciApi.endpoints.flow.select(requestId);
        const nextItem = davinciApi.endpoints.next.select(requestId);
        const startItem = davinciApi.endpoints.start.select(requestId);

        return flowItem || nextItem || startItem;
      },
    },
  };
}
