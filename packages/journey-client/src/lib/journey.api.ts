/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { initQuery, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { REQUESTED_WITH, getEndpointPath, stringify, resolve } from '@forgerock/sdk-utilities';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import type { Step } from '@forgerock/sdk-types';
import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

import { JourneyStep } from './step.types.js';

import type { InternalJourneyClientConfig } from './config.types.js';
import { NextOptions, StartParam } from './interfaces.js';

/**
 * Minimal state type for accessing journey config from RTK Query endpoints.
 * References the config slice directly (not nested under journey).
 */
interface JourneyRootState {
  config: InternalJourneyClientConfig;
}

function constructUrl(
  serverConfig: InternalJourneyClientConfig['serverConfig'],
  tree?: string,
  query?: Record<string, string>,
): string {
  const treeParams = tree ? { authIndexType: 'service', authIndexValue: tree } : undefined;
  const params: Record<string, string | undefined> = { ...query, ...treeParams };
  const queryString = Object.keys(params).length > 0 ? `?${stringify(params)}` : '';
  const path = getEndpointPath({
    endpoint: 'authenticate',
    customPaths: serverConfig.paths,
  });
  const url = resolve(serverConfig.baseUrl, `${path}${queryString}`);
  return url;
}

function constructSessionsUrl(
  serverConfig: InternalJourneyClientConfig['serverConfig'],
  query?: Record<string, string>,
): string {
  const params: Record<string, string | undefined> = { ...query };
  const queryString = Object.keys(params).length > 0 ? `?${stringify(params)}` : '';
  const path = getEndpointPath({
    endpoint: 'sessions',
    customPaths: serverConfig.paths,
  });
  const url = resolve(serverConfig.baseUrl, `${path}${queryString}`);
  return url;
}

function configureRequest(step?: JourneyStep): RequestInit {
  const init: RequestInit = {
    body: step ? JSON.stringify(step.payload) : undefined,
    credentials: 'include',
    headers: new Headers({}),
    method: 'POST',
  };

  return init;
}

function configureSessionRequest(): RequestInit {
  const init: RequestInit = {
    credentials: 'include',
    headers: new Headers({}),
    method: 'POST',
  };

  return init;
}

interface Extras {
  requestMiddleware: RequestMiddleware[];
  logger: ReturnType<typeof loggerFn>;
}

export const journeyApi = createApi({
  reducerPath: 'journeyReducer',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers: Headers) => {
      headers.set('Accept', 'application/json');
      headers.set('Accept-API-Version', 'protocol=1.0,resource=2.1');
      headers.set('Content-Type', 'application/json');
      headers.set('X-Requested-With', REQUESTED_WITH);

      return headers;
    },
  }),
  endpoints: (builder) => ({
    start: builder.mutation<Step, StartParam | undefined>({
      queryFn: async (
        options: StartParam | undefined,
        api: BaseQueryApi,
        _: unknown,
        baseQuery: BaseQueryFn,
      ) => {
        const state = api.getState() as JourneyRootState;
        const { serverConfig } = state.config;
        if (!serverConfig) {
          throw new Error('Server configuration is missing.');
        }

        const query = options?.query || {};

        const url = constructUrl(serverConfig, options?.journey, query);
        const request = configureRequest();

        const { requestMiddleware } = api.extra as Extras;

        const response = await initQuery({ ...request, url: url }, 'begin', {
          type: 'service',
          tree: options?.journey,
        })
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => {
            const result = await baseQuery(req, api, api.extra as Extras);
            return result as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
          });

        return response as QueryReturnValue<Step, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
    next: builder.mutation<Step, { step: JourneyStep; options?: NextOptions }>({
      queryFn: async (
        { step, options }: { step: JourneyStep; options?: NextOptions },
        api: BaseQueryApi,
        _: unknown,
        baseQuery: BaseQueryFn,
      ) => {
        const state = api.getState() as JourneyRootState;
        const { serverConfig } = state.config;
        if (!serverConfig) {
          throw new Error('Server configuration is missing.');
        }
        const query = options?.query || {};

        const url = constructUrl(serverConfig, undefined, query);
        const request = configureRequest(step);

        const { requestMiddleware } = api.extra as Extras;

        const response = await initQuery({ ...request, url }, 'continue')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => {
            const result = await baseQuery(req, api, api.extra as Extras);
            return result as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
          });

        return response as QueryReturnValue<Step, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
    terminate: builder.mutation<void, { query?: Record<string, string> } | undefined>({
      queryFn: async (
        options: { query?: Record<string, string> } | undefined,
        api: BaseQueryApi,
        _: unknown,
        baseQuery: BaseQueryFn,
      ) => {
        const state = api.getState() as JourneyRootState;
        const { serverConfig } = state.config;
        if (!serverConfig) {
          throw new Error('Server configuration is missing.');
        }

        const query = { ...options?.query, _action: 'logout' };

        const url = constructSessionsUrl(serverConfig, query);
        const request = configureSessionRequest();

        const { requestMiddleware } = api.extra as Extras;

        const response = await initQuery({ ...request, url }, 'terminate')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => {
            const result = await baseQuery(req, api, api.extra as Extras);
            return result as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
          });

        return response as QueryReturnValue<void, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
  }),
});
