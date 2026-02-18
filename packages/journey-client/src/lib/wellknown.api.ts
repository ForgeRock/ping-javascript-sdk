/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { initWellknownQuery } from '@forgerock/sdk-oidc';

import type { WellknownResponse } from '@forgerock/sdk-types';
import type {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

/**
 * RTK Query API for well-known endpoint discovery.
 *
 * Uses the `initWellknownQuery` builder pattern from `@forgerock/sdk-oidc`.
 * The builder constructs the request and validates the response;
 * `fetchBaseQuery` handles the HTTP transport through RTK Query's pipeline.
 */
export const wellknownApi = createApi({
  reducerPath: 'wellknown',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    configuration: builder.query<WellknownResponse, string>({
      queryFn: async (url, _api, _extra, baseQuery) => {
        const result = await initWellknownQuery(url).applyQuery(async (req) => {
          const queryResult = await baseQuery(req);
          return queryResult as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
        });
        return result as QueryReturnValue<
          WellknownResponse,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;
      },
    }),
  }),
});
