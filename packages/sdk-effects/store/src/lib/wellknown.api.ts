/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import { initWellknownQuery } from './wellknown.effects.js';

import type { WellknownResponse } from '@forgerock/sdk-types';
import type {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

/**
 * RootState type for wellknown selector consumers.
 * Minimal state shape with the wellknown reducer mounted.
 */
export interface WellknownState {
  wellknown: ReturnType<typeof wellknownApi.reducer>;
}

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

const createWellknownSelectorForUrl = (wellknownUrl: string) =>
  createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );

const wellknownSelectors = new Map<string, ReturnType<typeof createWellknownSelectorForUrl>>();

/**
 * Creates a memoized selector for cached well-known data.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @returns A memoized selector that extracts the WellknownResponse from state, or undefined if not yet fetched
 */
export function createWellknownSelector(wellknownUrl: string) {
  const existingSelector = wellknownSelectors.get(wellknownUrl);
  if (existingSelector) {
    return existingSelector;
  }

  const selector = createWellknownSelectorForUrl(wellknownUrl);
  wellknownSelectors.set(wellknownUrl, selector);
  return selector;
}

/**
 * Convenience selector for oidc-client's RootState type.
 *
 * Unlike {@link createWellknownSelector}, this immediately evaluates the
 * selector against the provided state rather than returning a reusable selector.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @param state - The oidc-client Redux root state
 * @returns The cached WellknownResponse or undefined if not yet fetched
 */
export function wellknownSelector(wellknownUrl: string, state: WellknownState) {
  const selector = createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
  return selector(state);
}
