import type { StepOptions } from '@forgerock/sdk-types';
import type { ServerConfig } from '@forgerock/sdk-types';
import { type logger as loggerFn } from '@forgerock/sdk-logger';

import { initQuery, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { type Step } from '@forgerock/sdk-types';

import { REQUESTED_WITH, getEndpointPath, stringify, resolve } from '@forgerock/sdk-utilities';

import type { JourneyClientConfig } from './config.types.js';
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

// Move these functions to the top, before journeyApi definition
function constructUrl(
  serverConfig: ServerConfig,
  realmPath?: string,
  tree?: string,
  query?: Record<string, string>,
): string {
  const treeParams = tree ? { authIndexType: 'service', authIndexValue: tree } : undefined;
  const params: Record<string, string | undefined> = { ...query, ...treeParams };
  const queryString = Object.keys(params).length > 0 ? `?${stringify(params)}` : '';
  const path = getEndpointPath({
    endpoint: 'authenticate',
    realmPath,
    customPaths: serverConfig.paths,
  });
  const url = resolve(serverConfig.baseUrl, `${path}${queryString}`);
  return url;
}

function configureRequest(step?: Step): RequestInit {
  const init: RequestInit = {
    body: step ? JSON.stringify(step) : undefined,
    credentials: 'include',
    headers: new Headers({}),
    method: 'POST',
  };

  return init;
}

interface Extras {
  requestMiddleware: RequestMiddleware[];
  logger: ReturnType<typeof loggerFn>;
  config: JourneyClientConfig;
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
    start: builder.mutation<Step, StepOptions | void>({
      queryFn: async (
        options: StepOptions | void,
        api: BaseQueryApi,
        _: unknown,
        baseQuery: BaseQueryFn,
      ) => {
        const { config } = api.extra as Extras;
        if (!config.serverConfig) {
          throw new Error('Server configuration is missing.');
        }
        const { realmPath, serverConfig, tree } = config;

        const query = options?.query || {};

        const url = constructUrl(serverConfig, realmPath, tree, query);
        const request = configureRequest();

        const { requestMiddleware } = api.extra as Extras;

        const response = await initQuery({ ...request, url: url }, 'start')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => {
            const result = await baseQuery(req, api, api.extra as Extras);
            return result as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
          });

        return response as QueryReturnValue<Step, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
    next: builder.mutation<Step, { step: Step; options?: StepOptions }>({
      queryFn: async (
        { step, options }: { step: Step; options?: StepOptions },
        api: BaseQueryApi,
        _: unknown,
        baseQuery: BaseQueryFn,
      ) => {
        const { config } = api.extra as Extras;
        if (!config.serverConfig) {
          throw new Error('Server configuration is missing.');
        }
        const { realmPath, serverConfig, tree } = config;
        const query = options?.query || {};

        const url = constructUrl(serverConfig, realmPath, tree, query);
        const request = configureRequest(step);

        const { requestMiddleware } = api.extra as Extras;

        const response = await initQuery({ ...request, url }, 'next')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => {
            const result = await baseQuery(req, api, api.extra as Extras);
            return result as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
          });

        return response as QueryReturnValue<Step, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
  }),
});
