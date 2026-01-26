/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import type { WellKnownResponse } from '@forgerock/sdk-types';

/**
 * RTK Query API for fetching the OIDC well-known configuration endpoint.
 *
 * The well-known endpoint (`.well-known/openid-configuration`) provides
 * OIDC Discovery information including:
 * - `authorization_endpoint` - URL for authorization requests
 * - `token_endpoint` - URL for token exchange
 * - `userinfo_endpoint` - URL for user info retrieval
 * - `end_session_endpoint` - URL for logout/session termination
 * - `revocation_endpoint` - URL for token revocation
 * - `jwks_uri` - URL for JSON Web Key Set
 * - `issuer` - The OIDC issuer identifier
 *
 * @example
 * ```typescript
 * // Add to your Redux store
 * const store = configureStore({
 *   reducer: {
 *     [wellknownApi.reducerPath]: wellknownApi.reducer,
 *   },
 *   middleware: (getDefault) => getDefault().concat(wellknownApi.middleware),
 * });
 *
 * // Fetch the configuration
 * const { data, error } = await store.dispatch(
 *   wellknownApi.endpoints.configuration.initiate(wellknownUrl)
 * );
 * ```
 */
export const wellknownApi = createApi({
  reducerPath: 'wellknown',
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    configuration: builder.query<WellKnownResponse, string>({
      query: (endpoint) => endpoint,
    }),
  }),
});

/**
 * Creates a selector to retrieve the cached well-known response from Redux state.
 *
 * This is a factory function that works with any Redux store structure,
 * as long as the wellknownApi reducer is mounted at the 'wellknown' path.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @returns A selector function that extracts the WellKnownResponse from state
 *
 * @example
 * ```typescript
 * const selector = createWellknownSelector(wellknownUrl);
 * const wellknownResponse = selector(store.getState());
 *
 * if (wellknownResponse?.authorization_endpoint) {
 *   // Use the authorization endpoint
 * }
 * ```
 */
export function createWellknownSelector(wellknownUrl: string) {
  return createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
}
