/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { GenericError } from '@forgerock/sdk-types';

// Re-export shared pure utilities from sdk-utilities
export { inferRealmFromIssuer, isValidWellknownUrl } from '@forgerock/sdk-utilities';

/**
 * Type guard that checks if a value is a non-null object.
 * Used for safe property access without `as` casting.
 *
 * @param value - The value to check
 * @returns True if value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Extracts a human-readable error message from an RTK Query error.
 *
 * RTK Query can return two types of errors:
 * - `FetchBaseQueryError`: Has `status` and either `error` (string) or `data` (parsed response)
 * - `SerializedError`: Has `message`, `name`, `code`, `stack` (from JS errors)
 *
 * @param error - The error from RTK Query dispatch result
 * @returns A human-readable error message
 *
 * @see https://redux-toolkit.js.org/rtk-query/usage-with-typescript#type-safe-error-handling
 */
function extractErrorMessage(error: FetchBaseQueryError | SerializedError): string {
  // FetchBaseQueryError has 'status' property
  if ('status' in error) {
    // 'error' is present for FETCH_ERROR, PARSING_ERROR, TIMEOUT_ERROR, CUSTOM_ERROR
    if ('error' in error) {
      return error.error;
    }
    // 'data' contains the parsed response body for HTTP errors
    if ('data' in error && isObject(error.data)) {
      const data = error.data;
      // Try to extract message from common error response formats
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
      if (typeof data.error_description === 'string') {
        return data.error_description;
      }
      // Fallback to stringifying the data
      return JSON.stringify(data);
    }
    return `HTTP error ${error.status}`;
  }

  // SerializedError has 'message' property
  return error.message ?? 'An unknown error occurred';
}

/**
 * Extracts the HTTP status code from an RTK Query error, if available.
 *
 * @param error - The error from RTK Query dispatch result
 * @returns The HTTP status code, or 'unknown' if not available
 */
function extractErrorStatus(error: FetchBaseQueryError | SerializedError): number | string {
  if ('status' in error) {
    return error.status;
  }
  return 'unknown';
}

/**
 * Creates a GenericError from an RTK Query error for well-known fetch failures.
 *
 * This follows the established pattern in the codebase for converting RTK Query
 * errors to the SDK's GenericError type with `type: 'wellknown_error'`.
 *
 * @param error - The error from RTK Query dispatch result, or undefined if no response
 * @returns A GenericError with type 'wellknown_error'
 *
 * @example
 * ```typescript
 * const { data, error } = await store.dispatch(
 *   wellknownApi.endpoints.configuration.initiate(url)
 * );
 *
 * if (error || !data) {
 *   const genericError = createWellknownError(error);
 *   log.error(genericError.message);
 *   throw new Error(genericError.message);
 * }
 * ```
 */
export function createWellknownError(error?: FetchBaseQueryError | SerializedError): GenericError {
  if (error) {
    return {
      error: 'Well-known configuration fetch failed',
      message: extractErrorMessage(error),
      type: 'wellknown_error',
      status: extractErrorStatus(error),
    };
  }

  return {
    error: 'Well-known configuration fetch failed',
    message: 'No response received from well-known endpoint',
    type: 'wellknown_error',
    status: 'unknown',
  };
}
