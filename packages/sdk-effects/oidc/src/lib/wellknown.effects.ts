/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

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

function extractErrorMessage(data: unknown): string | undefined {
  if (!isObject(data)) return undefined;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.error_description === 'string') return data.error_description;
  return JSON.stringify(data);
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

/** Default timeout for the built-in fetch transport (30 seconds). */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Default request function using the Fetch API.
 *
 * Used when no custom `requestFn` is provided. Includes a 30-second timeout
 * and maps errors to structured results: AbortError to `'abort'` status,
 * other errors to `'network'` status. For non-ok responses, attempts to
 * extract a message from the JSON body.
 */
async function defaultRequestFn(url: string): Promise<WellknownRequestResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const extracted = extractErrorMessage(await response.json());
        if (extracted) errorMessage = extracted;
      } catch {
        // JSON parse failed on error response body; use default HTTP status message.
        // This is expected when servers return HTML error pages or empty bodies.
      }
      return { error: createError(errorMessage, response.status) };
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return {
        error: createError(
          `Failed to parse well-known response as JSON (HTTP ${response.status})`,
          response.status,
        ),
      };
    }

    return { data };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return { error: createError('Request was aborted', 'abort') };
      }
      return { error: createError(error.message, 'network') };
    }
    return { error: createError('An unknown error occurred') };
  }
}

/**
 * Fetches and validates OIDC well-known configuration.
 *
 * Pass a custom `requestFn` to control how the HTTP request is made.
 * When omitted, the built-in Fetch API is used (with a 30-second timeout).
 *
 * @param url - The well-known endpoint URL
 * @param requestFn - Optional custom request function (e.g., RTK Query's baseQuery)
 * @returns A {@link FetchWellknownResult} — either `{ success: true, data }` or `{ success: false, error }`
 *
 * @example
 * ```typescript
 * // Simple — uses built-in fetch
 * const result = await fetchWellknownConfiguration(
 *   'https://auth.example.com/.well-known/openid-configuration',
 * );
 * ```
 *
 * @example
 * ```typescript
 * // With RTK Query baseQuery — inside a queryFn
 * queryFn: async (url, _api, _extra, baseQuery) => {
 *   const result = await fetchWellknownConfiguration(url, baseQuery);
 *   return result.success ? { data: result.data } : { error: result.error };
 * }
 * ```
 */
export async function fetchWellknownConfiguration(
  url: string,
  requestFn?: WellknownRequestFn,
): Promise<FetchWellknownResult> {
  let result: WellknownRequestResult;

  try {
    result = await (requestFn ?? defaultRequestFn)(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred during well-known fetch';
    return { success: false, error: createError(message) };
  }

  if (result.error) {
    return { success: false, error: result.error };
  }

  if (!isValidWellknownResponse(result.data)) {
    return {
      success: false,
      error: createError(
        'Invalid well-known response: missing required fields (issuer, authorization_endpoint, token_endpoint)',
      ),
    };
  }

  return { success: true, data: result.data };
}
