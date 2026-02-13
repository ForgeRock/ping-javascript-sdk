/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { initWellknownQuery } from '@forgerock/sdk-oidc';

import type { WellknownResponse } from '@forgerock/sdk-types';
import type {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

type BaseQueryResponse = Promise<
  QueryReturnValue<WellknownResponse, FetchBaseQueryError, FetchBaseQueryMeta>
>;

/**
 * RTK Query API for well-known endpoint discovery.
 *
 * Uses `queryFn` to pass the baseQuery into the framework-agnostic
 * `fetchWellknownConfiguration` effect, which handles response validation.
 * The baseQuery handles HTTP transport.
 */
export const wellknownApi = createApi({
  reducerPath: 'wellknown',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    configuration: builder.query<WellknownResponse, string>({
      async queryFn(url, _api, _extra, baseQuery) {
        const response: BaseQueryResponse = initWellknownQuery(url).applyQuery(
          async (req: FetchArgs) => await baseQuery(req),
        );

        return response;
      },
    }),
  }),
});

/**
 * Creates a memoized selector for cached well-known data.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @returns A memoized selector that extracts the WellknownResponse from state, or undefined if not yet fetched
 */
export function createWellknownSelector(wellknownUrl: string) {
  return createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
}
