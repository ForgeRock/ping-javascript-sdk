/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenericError } from '@forgerock/sdk-types';

/**
 * Extracts a message string from an unknown error value.
 */
function extractMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    // FetchBaseQueryError string-status variant (e.g. FETCH_ERROR, CUSTOM_ERROR)
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    // FetchBaseQueryError numeric-status variant stores details in .data
    if ('data' in error && typeof error.data === 'object' && error.data !== null) {
      const data = error.data as Record<string, unknown>;
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;
      if (typeof data.error_description === 'string') return data.error_description;
    }
    if (
      'status' in error &&
      (typeof error.status === 'number' || typeof error.status === 'string')
    ) {
      return `HTTP error ${String(error.status)}`;
    }
  }
  return 'An unknown error occurred';
}

/** The required path suffix for OpenID Connect Discovery endpoints. */
const WELLKNOWN_PATH_SUFFIX = '/.well-known/openid-configuration';

/**
 * Validates that a well-known URL is properly formatted.
 *
 * Checks that the URL:
 * 1. Is a valid URL
 * 2. Uses HTTPS (or HTTP for localhost development)
 * 3. Ends with `/.well-known/openid-configuration` (per OpenID Connect Discovery 1.0)
 *
 * @param wellknownUrl - The URL to validate
 * @returns True if the URL is valid, secure, and has the correct path suffix
 *
 * @example
 * ```typescript
 * isValidWellknownUrl('https://am.example.com/.well-known/openid-configuration')
 * // Returns: true
 *
 * isValidWellknownUrl('http://localhost:8080/.well-known/openid-configuration')
 * // Returns: true (localhost allows HTTP)
 *
 * isValidWellknownUrl('https://am.example.com/am/oauth2/alpha')
 * // Returns: false (missing /.well-known/openid-configuration path)
 *
 * isValidWellknownUrl('not-a-url')
 * // Returns: false
 * ```
 */
export function isValidWellknownUrl(wellknownUrl: string): boolean {
  try {
    const url = new URL(wellknownUrl);

    // Allow HTTP only for localhost (development)
    // Note: We intentionally do not check for IPv6 localhost (::1) as it is rarely used
    // in local development and adds complexity. Most dev servers bind to localhost or 127.0.0.1.
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isSecure = url.protocol === 'https:';
    const isHttpLocalhost = url.protocol === 'http:' && isLocalhost;

    if (!isSecure && !isHttpLocalhost) return false;

    return url.pathname.endsWith(WELLKNOWN_PATH_SUFFIX);
  } catch {
    return false;
  }
}

/**
 * Type guard to check if an error is already a GenericError.
 */
function isGenericError(error: unknown): error is GenericError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'error' in error
  );
}

/**
 * Creates a GenericError from an RTK Query error for well-known fetch failures.
 *
 * Handles both GenericError (from custom baseQuery error responses) and
 * SerializedError (from unexpected JS errors during the fetch).
 *
 * @param error - The error from RTK Query dispatch result, or undefined if no response
 * @returns The original GenericError if already one, or a new GenericError with type 'wellknown_error'
 */
export function createWellknownError(error?: unknown): GenericError {
  if (!error) {
    return {
      error: 'Well-known configuration fetch failed',
      message: 'No response received from well-known endpoint',
      type: 'wellknown_error',
      status: 'unknown',
    };
  }

  if (isGenericError(error)) {
    return error;
  }

  return {
    error: 'Well-known configuration fetch failed',
    message: extractMessage(error),
    type: 'wellknown_error',
    status: 'unknown',
  };
}
