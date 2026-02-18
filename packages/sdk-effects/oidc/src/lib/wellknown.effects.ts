/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { WellknownResponse, GenericError } from '@forgerock/sdk-types';

/**
 * Structural types compatible with RTK Query's shapes.
 * Defined locally to keep the effects layer framework-agnostic
 * (no dependency on @reduxjs/toolkit).
 */

/** Compatible with RTK Query's FetchArgs. */
interface WellknownFetchArgs {
  url: string;
  headers: Record<string, string>;
}

/** Compatible with RTK Query's FetchBaseQueryError. */
interface WellknownQueryError {
  status: number | string;
  data?: unknown;
  error?: string;
}

/** Compatible with RTK Query's QueryReturnValue. */
type WellknownQueryResult<T> =
  | { data: T; error?: undefined; meta?: unknown }
  | { data?: undefined; error: WellknownQueryError; meta?: unknown };

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

/** Callback type for the query builder — wraps RTK Query's `baseQuery`. */
type QueryCallback = (args: WellknownFetchArgs) => Promise<WellknownQueryResult<unknown>>;

/**
 * Creates a well-known query builder for use inside RTK Query `queryFn`.
 *
 * Constructs a request object from the URL, then exposes `applyQuery` to
 * execute the request through the caller's `baseQuery`. Response validation
 * uses {@link isValidWellknownResponse}.
 *
 * @param url - The well-known endpoint URL
 * @returns A builder with `applyQuery(callback)` that returns a result compatible with RTK Query's `QueryReturnValue`
 *
 * @example
 * ```typescript
 * queryFn: async (url, _api, _extra, baseQuery) => {
 *   return initWellknownQuery(url).applyQuery(async (req) => await baseQuery(req));
 * }
 * ```
 */
export function initWellknownQuery(url: string) {
  const request: WellknownFetchArgs = {
    url,
    headers: { Accept: 'application/json' },
  };

  return {
    async applyQuery(callback: QueryCallback): Promise<WellknownQueryResult<WellknownResponse>> {
      let result: WellknownQueryResult<unknown>;

      try {
        result = await callback(request);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'An unknown error occurred during well-known fetch';
        return {
          error: {
            status: 'CUSTOM_ERROR',
            error: message,
            data: createError(message),
          },
        };
      }

      if (result.error) {
        return { error: result.error };
      }

      if (!isValidWellknownResponse(result.data)) {
        return {
          error: {
            status: 'CUSTOM_ERROR',
            error:
              'Invalid well-known response: missing required fields (issuer, authorization_endpoint, token_endpoint)',
            data: createError(
              'Invalid well-known response: missing required fields (issuer, authorization_endpoint, token_endpoint)',
            ),
          },
        };
      }

      return { data: result.data };
    },
  };
}
