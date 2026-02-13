/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

import type { WellknownResponse, GenericError } from '@forgerock/sdk-types';

/**
 * The result shape returned by a {@link WellknownRequestFn}.
 *
 * Exactly one of `data` or `error` must be present — this is enforced
 * via a discriminated union so that illegal states are unrepresentable.
 */
export type WellknownRequestResult =
  | { data: unknown; error?: undefined }
  | { data?: undefined; error: GenericError };

/**
 * A function that fetches a URL and returns `{ data }` or `{ error }`.
 *
 * This is the injection point for custom HTTP transports. When used with
 * RTK Query, pass the `baseQuery` from `queryFn` directly.
 *
 * The function should return `{ data }` on success or `{ error }` on failure.
 * Returning both as undefined is a type error.
 */
export type WellknownRequestFn = (
  url: string,
) => PromiseLike<WellknownRequestResult> | WellknownRequestResult;

/** Successful result from fetching well-known configuration. */
export interface FetchWellknownSuccess {
  success: true;
  data: WellknownResponse;
}

/** Failed result from fetching well-known configuration. */
export interface FetchWellknownFailure {
  success: false;
  error: GenericError;
}

/** Result type — either success with data or failure with error. */
export type FetchWellknownResult = FetchWellknownSuccess | FetchWellknownFailure;

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

/** Type guard for successful fetch. */
export function isFetchWellknownSuccess(
  result: FetchWellknownResult,
): result is FetchWellknownSuccess {
  return result.success === true;
}

/** Type guard for failed fetch. */
export function isFetchWellknownFailure(
  result: FetchWellknownResult,
): result is FetchWellknownFailure {
  return result.success === false;
}

function createError(message: string, status: number | string = 'unknown'): GenericError {
  return {
    error: 'Well-known configuration fetch failed',
    message,
    type: 'wellknown_error',
    status,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validates that the response contains the minimum required OIDC well-known fields.
 *
 * Checks for `issuer`, `authorization_endpoint`, and `token_endpoint` — the
 * minimum subset needed by this SDK. Note that the full OpenID Connect
 * Discovery 1.0 spec defines additional required fields that some providers
 * may not include.
 */
export function isValidWellknownResponse(data: unknown): data is WellknownResponse {
  if (!isObject(data)) return false;
  return (
    typeof data.issuer === 'string' &&
    typeof data.authorization_endpoint === 'string' &&
    typeof data.token_endpoint === 'string'
  );
}

/**
 * Fetches and validates OIDC well-known configuration.
 *
 * Pass a custom `requestFn` to control how the HTTP request is made.
 *
 * @param url - The well-known endpoint URL
 * @param requestFn - Custom request function (e.g., RTK Query's baseQuery)
 * @returns A {@link FetchWellknownResult} — either `{ success: true, data }` or `{ success: false, error }`
 *
 * @example
 * ```typescript
 * // With RTK Query baseQuery — inside a queryFn
 * queryFn: async (url, _api, _extra, baseQuery) => {
 *   const result = await initWellknownQuery(url);
 *   return result.success ? { data: result.data } : { error: result.error };
 * }
 * ```
 */
export function initWellknownQuery(url: string) {
  const request: FetchArgs = {
    url,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return {
    async applyQuery(
      callback: (
        request: FetchArgs,
      ) => Promise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
    ) {
      let result;

      try {
        result = await callback(request);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'An unknown error occurred during well-known fetch';
        return { success: false, error: createError(message) };
      }

      if (result.error) {
        return { success: false, error: result.error };
      }

      if (!isValidWellknownResponse(result.data)) {
        return {
          success: false,
          error: createError('Invalid well-known response: missing required fields (issuer)'),
        };
      }

      return { success: true, data: result.data } as FetchWellknownSuccess;
    },
  };
}
