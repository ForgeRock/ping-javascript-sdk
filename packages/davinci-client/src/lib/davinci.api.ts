/**
 * Import the RTK Query library from Redux Toolkit
 * @see https://redux-toolkit.js.org/rtk-query/overview
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

/**
 * Import internal modules
 */
import { createAuthorizeUrl } from './authorize.utils.js';
import { handleResponse, transformActionRequest, transformSubmitRequest } from './davinci.utils.js';

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

/**
 * @const davinciApi - Define the DaVinci API for Redux state management
 * @see https://redux-toolkit.js.org/rtk-query/overview
 */
export const davinciApi = createApi({
  reducerPath: 'davinci',
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
        const requestBody = transformActionRequest(state.node, params.action);

        let href = '';

        if (links && 'next' in links) {
          href = links['next'].href || '';
        }

        const response = await baseQuery({
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
        });

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

        handleResponse(cacheEntry, api.dispatch, response?.status || 0);
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

        let requestBody;
        let href = '';

        if (links && 'next' in links) {
          href = links['next'].href || '';
        }

        if (!body) {
          requestBody = transformSubmitRequest(state.node);
        } else {
          requestBody = body;
        }

        const response = await baseQuery({
          url: href,
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            interactionId: state.node.server.interactionId,
            interactionToken: state.node.server.interactionToken,
          },
          body: JSON.stringify(requestBody),
        });

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

        handleResponse(cacheEntry, api.dispatch, response?.status || 0);
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
            responseType: state?.config?.responseType,
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

          const response = await baseQuery({
            url: url.toString(),
            credentials: 'include',
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

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
        handleResponse(cacheEntry, api.dispatch, response?.status || 0);
      },
    }),
    resume: builder.query<unknown, { continueToken: string }>({
      async queryFn({ continueToken }, _api, _c, baseQuery) {
        const continueUrl = window.localStorage.getItem('continueUrl') || null;

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
        if (!continueUrl) {
          return {
            error: {
              data: 'No continue url',
              message:
                'Resume needs a continue url, none was found in storage. Please restart your flow',
              status: 200,
            },
          };
        }

        if (continueUrl) {
          window.localStorage.removeItem('continueUrl');
        }

        const response = await baseQuery({
          url: continueUrl,
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${continueToken}`,
          },
          body: JSON.stringify({}),
        });

        return response;
      },
      async onQueryStarted(_, api) {
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
        console.log('resumed handling repsonse');
        handleResponse(cacheEntry, api.dispatch, response?.status || 0);
      },
    }),
  }),
});
