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
 * RTK Query API for well-known endpoint discovery.
 *
 * Uses the `initWellknownQuery` builder pattern from `./wellknown.effects.js`.
 * The builder constructs the request and validates the response;
 * `fetchBaseQuery` handles the HTTP transport through RTK Query's pipeline.
 *
 * This is the canonical single instance — all SDK client packages import from here
 * so that a shared Redux store gets a single cache entry per URL.
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

/** Minimum state shape required to use wellknown selectors. */
export type WellknownState = {
  [wellknownApi.reducerPath]: ReturnType<typeof wellknownApi.reducer>;
};

/**
 * Per-URL selector cache.
 *
 * `createSelector` memoizes against its inputs, so a fresh instance per call
 * would start with a cold cache every time and never hit. Keying instances by
 * URL is what makes the memoization actually effective. This is a pure cache:
 * the same URL always yields the same selector, and it is unobservable from
 * outside beyond that identity.
 */
const selectorCache = new Map<string, WellknownStateSelector>();

type WellknownStateSelector = ReturnType<
  typeof createSelector<
    [ReturnType<typeof wellknownApi.endpoints.configuration.select>],
    WellknownResponse | undefined
  >
>;

/**
 * Creates a memoized selector for cached well-known data.
 *
 * Repeated calls with the same URL return the *same* selector instance, so the
 * memoization is shared across every call site.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @returns A memoized selector that extracts the WellknownResponse from state, or undefined if not yet fetched
 */
export function createWellknownSelector(wellknownUrl: string): WellknownStateSelector {
  const cached = selectorCache.get(wellknownUrl);
  if (cached) {
    return cached;
  }

  const selector = createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  ) as WellknownStateSelector;

  selectorCache.set(wellknownUrl, selector);
  return selector;
}

/**
 * Convenience selector for any state that contains the wellknown slice.
 *
 * Unlike {@link createWellknownSelector}, this immediately evaluates the
 * selector against the provided state rather than returning a reusable selector.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @param state - Any Redux state that includes the wellknown slice
 * @returns The cached WellknownResponse or undefined if not yet fetched
 */
export function wellknownSelector<S extends WellknownState>(wellknownUrl: string, state: S) {
  const selector = createWellknownSelector(wellknownUrl);
  return selector(state);
}
