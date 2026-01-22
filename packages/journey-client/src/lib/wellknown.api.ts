/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import type { WellKnownResponse } from '@forgerock/sdk-types';
import type { RootState } from './client.store.utils.js';

/**
 * RTK Query API for fetching the OIDC well-known configuration endpoint.
 *
 * The well-known endpoint provides OIDC-related URLs such as:
 * - authorization_endpoint
 * - token_endpoint
 * - userinfo_endpoint
 * - end_session_endpoint
 * - revocation_endpoint
 *
 * Note: AM-specific endpoints (authenticate, sessions) are NOT included
 * in the standard OIDC well-known response and must be derived from
 * the baseUrl configuration.
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
 * Selector to retrieve the cached well-known response from Redux state.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @param state - The Redux root state
 * @returns The cached WellKnownResponse or undefined if not yet fetched
 */
export function wellknownSelector(
  wellknownUrl: string,
  state: RootState,
): WellKnownResponse | undefined {
  const selector = createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
  return selector(state);
}
