/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the RTK Query library from Redux Toolkit
 * @see https://redux-toolkit.js.org/rtk-query/overview
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

/**
 * Import internal modules
 */
import { initQuery } from '@forgerock/sdk-request-middleware';
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import type {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

import { handleResponse, transformActionRequest, transformSubmitRequest } from './davinci.utils.js';

import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';

/**
 * Import the DaVinci types
 */
import type { RootStateWithNode } from './client.store.utils.js';
import type {
  DaVinciCacheEntry,
  OutgoingQueryParams,
  StartOptions,
  ThrownQueryError,
} from './davinci.types.js';
import type { ContinueNode } from './node.types.js';
import type { StartNode } from '../types.js';

type BaseQueryResponse = Promise<
  QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
>;

interface Extras<ActionType extends ActionTypes = ActionTypes, Payload = unknown> {
  requestMiddleware: RequestMiddleware<ActionType, Payload>[];
  logger: ReturnType<typeof loggerFn>;
}

/**
 * @const davinciApi - Define the DaVinci API for Redux state management
 * @see https://redux-toolkit.js.org/rtk-query/overview
 */
export const davinciApi = createApi({
  reducerPath: 'davinci',
  // TODO: implement extraOptions for request interceptors: https://stackoverflow.com/a/77569083 & https://stackoverflow.com/a/65129117
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      headers.set('x-requested-with', 'ping-sdk');
      headers.set('x-requested-platform', 'javascript');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    /**
     * @method flow - method for initiating a new flow with the DaVinci API
     */
    flow: builder.mutation({
      /**
       * @method queryFn - This is just a wrapper around the fetch call
       */
      async queryFn(params, api, __, baseQuery) {
        const state = api.getState() as RootStateWithNode<ContinueNode>;
        const links = state.node.server._links;
        const requestBody = transformActionRequest(
          state.node,
          params.action,
          (api.extra as Extras).logger,
        );
        const { requestMiddleware, logger } = api.extra as Extras;

        let href = '';

        if (links && 'next' in links) {
          href = links['next'].href || '';
        }
        const request: FetchArgs = {
          // TODO: If we don't have a `next.href`, we should handle this better
          url: href,
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            interactionId: state.node.server.interactionId,
            interactionToken: state.node.server.interactionToken,
          },
          body: JSON.stringify(requestBody),
        };
        logger.debug('Davinci API request', request);
        const response: BaseQueryResponse = initQuery(request, 'flow')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));
        /**
         * Returns the original response from DaVinci,
         * this gets transformed in the onQueryStarted method
         */
        return response;
      },
      /**
       * @method onQueryStarted - method for handling the response from the DaVinci API
       *
       * The method name below is a bit misleading. It is not just
       * called when the query is started, but throughout the lifecycle of
       * the API, including when the query is fulfilled. This is because
       * the query is started, and then the response is awaited, and then
       * the response is processed.
       *
       * NOTE: The below is repeated for each endpoint, which is not "DRY",
       * but doing it inline reduces the typing complexity as all the
       * parameters are pre-typed from the library.
       */
      async onQueryStarted(_, api) {
        const logger = (api.extra as Extras).logger;
        let response;

        try {
          const query = await api.queryFulfilled;
          response = query.meta?.response;
        } catch (err: unknown) {
          const error = err as ThrownQueryError;

          /**
           * This error is thrown when the query is rejected. We don't
           * want to do anything with it for now.
           */
          response = error.meta?.response;
        }

        const cacheEntry: DaVinciCacheEntry = api.getCacheEntry();

        logger.debug('Davinci API response', cacheEntry);

        handleResponse(cacheEntry, api.dispatch, response?.status || 0, logger);
      },
    }),

    /**
     * @method next - method for initiating the next node in the current flow
     */
    next: builder.mutation({
      /**
       * @method queryFn - This is just a wrapper around the fetch call
       */
      async queryFn(body, api, __, baseQuery) {
        const state = api.getState() as RootStateWithNode<ContinueNode>;
        const links = state.node.server._links;
        const { requestMiddleware, logger } = api.extra as Extras;

        let requestBody;
        let href = '';

        if (links && 'next' in links) {
          href = links['next'].href || '';
        }

        if (!body) {
          requestBody = transformSubmitRequest(state.node, logger);
        } else {
          requestBody = body;
        }

        const request: FetchArgs = {
          url: href,
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            interactionId: state.node.server.interactionId,
            interactionToken: state.node.server.interactionToken,
          },
          body: JSON.stringify(requestBody),
        };

        logger.debug('Davinci API request', request);
        const response: BaseQueryResponse = initQuery(request, 'next')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        /**
         * Returns the original response from DaVinci,
         * this gets transformed in the onQueryStarted method
         */
        return response;
      },
      /**
       * @method onQueryStarted - method for handling the response from the DaVinci API
       *
       * The method name below is a bit misleading. It is not just
       * called when the query is started, but throughout the lifecycle of
       * the API, including when the query is fulfilled. This is because
       * the query is started, and then the response is awaited, and then
       * the response is processed.
       *
       * NOTE: The below is repeated for each endpoint, which is not "DRY",
       * but doing it inline reduces the typing complexity as all the
       * parameters are pre-typed from the library.
       */
      async onQueryStarted(_, api) {
        const logger = (api.extra as Extras).logger;
        let response;

        try {
          const query = await api.queryFulfilled;
          response = query.meta?.response;
        } catch (err: unknown) {
          const error = err as ThrownQueryError;

          /**
           * This error is thrown when the query is rejected. We don't
           * want to do anything with it for now.
           */
          response = error.meta?.response;
        }

        const cacheEntry: DaVinciCacheEntry = api.getCacheEntry();

        logger.debug('Davinci API response', cacheEntry);

        handleResponse(cacheEntry, api.dispatch, response?.status || 0, logger);
      },
    }),

    /**
     * @method start - method for initiating a DaVinci flow
     * @param - needs no arguments, but need to declare types to make it explicit
     */
    start: builder.mutation<unknown, StartOptions<OutgoingQueryParams> | undefined>({
      /**
       * @method queryFn - This is just a wrapper around the fetch call
       */
      async queryFn(options, api, __, baseQuery) {
        const { requestMiddleware, logger } = api.extra as Extras;
        const state = api.getState() as RootStateWithNode<StartNode>;

        if (!state) {
          return {
            error: {
              status: 400,
              data: 'Store must be initialized before use',
            },
          };
        }

        const authorizeEndpoint = state.config.endpoints.authorize;

        if (!authorizeEndpoint) {
          return { error: { status: 400, data: 'authorizeEndpoint URL must be set' } };
        }

        try {
          const authorizeUrl = await createAuthorizeUrl(authorizeEndpoint, {
            clientId: state?.config?.clientId,
            login: 'redirect', // TODO: improve this in SDK to be more semantic
            redirectUri: state?.config?.redirectUri,
            responseType: state?.config?.responseType as 'code',
            responseMode: 'pi.flow',
            scope: state?.config?.scope,
          });
          const url = new URL(authorizeUrl);
          const existingParams = url.searchParams;

          if (options?.query) {
            Object.entries(options.query).forEach(([key, value]) => {
              /**
               * We use set here because if we have existing params, we want
               * to make sure we override them and not add duplicates
               */
              existingParams.set(key, String(value));
            });

            url.search = existingParams.toString();
          }

          const request: FetchArgs = {
            url: url.toString(),
            credentials: 'include',
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          logger.debug('Davinci API request', request);
          const response: BaseQueryResponse = initQuery(request, 'start')
            .applyMiddleware(requestMiddleware)
            .applyQuery(async (req: FetchArgs) => await baseQuery(req));

          /**
           * Returns the original response from DaVinci,
           * this gets transformed in the onQueryStarted method
           */
          return response;
        } catch (error: unknown) {
          if (error instanceof Error) {
            return { error: { status: 400, data: error.message } };
          }
          return { error: { status: 400, data: 'An unknown error occurred' } };
        }
      },
      /**
       * @method onQueryStarted - method for handling the response from the DaVinci API
       *
       * The method name below is a bit misleading. It is not just
       * called when the query is started, but throughout the lifecycle of
       * the API, including when the query is fulfilled. This is because
       * the query is started, and then the response is awaited, and then
       * the response is processed.
       *
       * NOTE: The below is repeated for each endpoint, which is not "DRY",
       * but doing it inline reduces the typing complexity as all the
       * parameters are pre-typed from the library.
       */
      async onQueryStarted(_, api) {
        const logger = (api.extra as Extras).logger;
        let response;

        try {
          const query = await api.queryFulfilled;
          response = query.meta?.response;
        } catch (err: unknown) {
          const error = err as ThrownQueryError;

          /**
           * This error is thrown when the query is rejected. We don't
           * want to do anything with it for now.
           */
          response = error.meta?.response;
        }

        const cacheEntry: DaVinciCacheEntry = api.getCacheEntry();

        logger.debug('Davinci API response', cacheEntry);

        handleResponse(cacheEntry, api.dispatch, response?.status || 0, logger);
      },
    }),
    resume: builder.query<unknown, { serverInfo: ContinueNode['server']; continueToken: string }>({
      async queryFn({ serverInfo, continueToken }, api, _c, baseQuery) {
        const { requestMiddleware, logger } = api.extra as Extras;
        const links = serverInfo._links;

        if (!continueToken) {
          return {
            error: {
              data: 'No continue token',
              message:
                'Resume meant to be called in a social login. Continue token was not found on the url',
              status: 200,
            },
          };
        }
        if (
          !links ||
          !('continue' in links) ||
          !('href' in links['continue']) ||
          !links['continue'].href
        ) {
          return {
            error: {
              data: 'No continue url',
              message:
                'Resume needs a continue url, none was found in storage. Please restart your flow',
              status: 200,
            },
          };
        }

        const continueUrl = links['continue'].href;
        const request: FetchArgs = {
          url: continueUrl,
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${continueToken}`,
          },
          body: JSON.stringify({}),
        };

        logger.debug('Davinci API request', request);
        const response: BaseQueryResponse = initQuery(request, 'resume')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        return response;
      },
      async onQueryStarted(_, api) {
        const logger = (api.extra as Extras).logger;
        let response;

        try {
          const query = await api.queryFulfilled;
          response = query.meta?.response;
        } catch (err: unknown) {
          const error = err as ThrownQueryError;

          /**
           * This error is thrown when the query is rejected. We don't
           * want to do anything with it for now.
           */
          response = error.meta?.response;
        }

        const cacheEntry: DaVinciCacheEntry = api.getCacheEntry();

        logger.debug('Davinci API response', cacheEntry);

        handleResponse(cacheEntry, api.dispatch, response?.status || 0, logger);
      },
    }),
  }),
});
