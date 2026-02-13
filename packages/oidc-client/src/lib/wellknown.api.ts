/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { fetchWellknownConfiguration } from '@forgerock/sdk-oidc';

import type { WellknownResponse, GenericError } from '@forgerock/sdk-types';
import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from './client.types.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Converts FetchBaseQueryError to GenericError.
 */
function toGenericError(error: FetchBaseQueryError): GenericError {
  const status = error.status;
  let message = `HTTP error ${String(status)}`;

  if ('error' in error) {
    message = error.error;
  } else if ('data' in error && isObject(error.data)) {
    if (typeof error.data['message'] === 'string') message = error.data['message'];
    else if (typeof error.data['error'] === 'string') message = error.data['error'];
    else if (typeof error.data['error_description'] === 'string')
      message = error.data['error_description'];
    else message = JSON.stringify(error.data);
  }

  return {
    error: 'Well-known configuration fetch failed',
    message,
    type: 'wellknown_error',
    status,
  };
}

/**
 * Configured fetchBaseQuery that sets `Accept: application/json` headers.
 */
const innerBaseQuery = fetchBaseQuery({
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

/**
 * BaseQuery wrapper that normalizes FetchBaseQueryError to GenericError.
 *
 * This allows the wellknownApi to use GenericError as its error type
 * while the actual HTTP transport goes through RTK Query's pipeline.
 */
const wellknownBaseQuery: BaseQueryFn<string, unknown, GenericError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await innerBaseQuery(args, api, extraOptions);
  if (result.error) {
    return { ...result, error: toGenericError(result.error) };
  }
  return result;
};

/**
 * RTK Query API for well-known endpoint discovery.
 *
 * Uses `queryFn` to pass the baseQuery into the framework-agnostic
 * `fetchWellknownConfiguration` effect, which handles response validation.
 * The baseQuery handles HTTP transport.
 */
export const wellknownApi = createApi({
  reducerPath: 'wellknown',
  baseQuery: wellknownBaseQuery,
  endpoints: (builder) => ({
    configuration: builder.query<WellknownResponse, string>({
      queryFn: async (url, _api, _extra, baseQuery) => {
        const result = await fetchWellknownConfiguration(url, baseQuery);
        return result.success ? { data: result.data } : { error: result.error };
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
export function wellknownSelector(wellknownUrl: string, state: RootState) {
  const selector = createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
  return selector(state);
}
