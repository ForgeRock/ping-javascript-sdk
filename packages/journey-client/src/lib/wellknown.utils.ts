/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { SerializedError } from '@reduxjs/toolkit';
import type { GenericError } from '@forgerock/sdk-types';

/**
 * Type guard to check if an error is already a GenericError.
 *
 * GenericError from our custom wellknownBaseQuery has: error, message, type, status
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
 * Since the wellknownApi uses a custom baseQuery that returns GenericError directly,
 * this function handles both GenericError (from successful error responses) and
 * SerializedError (from unexpected JS errors during the fetch).
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
export function createWellknownError(error?: GenericError | SerializedError): GenericError {
  if (!error) {
    return {
      error: 'Well-known configuration fetch failed',
      message: 'No response received from well-known endpoint',
      type: 'wellknown_error',
      status: 'unknown',
    };
  }

  // If it's already a GenericError from our custom baseQuery, return it directly
  if (isGenericError(error)) {
    return error;
  }

  // SerializedError from unexpected JS errors
  return {
    error: 'Well-known configuration fetch failed',
    message: error.message ?? 'An unknown error occurred',
    type: 'wellknown_error',
    status: 'unknown',
  };
}

/**
 * ForgeRock AM URL patterns for realm extraction.
 *
 * AM has evolved through several URL formats:
 * - Legacy subrealm: /oauth2/realms/root/realms/{realm}
 * - Legacy root: /oauth2/realms/root
 * - Simplified (current): /oauth2/{realm}
 */
const REALM_PATTERNS = [
  /\/oauth2\/realms\/root\/realms\/(.+)$/,
  /\/oauth2\/realms\/(root)$/,
  /\/oauth2\/([^/]+)$/,
] as const;

/**
 * Infers the realm path from a ForgeRock AM issuer URL.
 * Returns undefined for non-AM issuers.
 */
export function inferRealmFromIssuer(issuer: string): string | undefined {
  try {
    const pathname = new URL(issuer).pathname;
    for (const pattern of REALM_PATTERNS) {
      const match = pathname.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Infers the base URL from a wellknown endpoint URL.
 * Extracts everything before `/oauth2/` in the path.
 *
 * Example: `https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration`
 * Returns: `https://am.example.com/am/`
 */
export function inferBaseUrlFromWellknown(wellknownUrl: string): string | undefined {
  try {
    const url = new URL(wellknownUrl);
    const oauth2Index = url.pathname.indexOf('/oauth2/');
    if (oauth2Index === -1) return undefined;
    url.pathname = url.pathname.slice(0, oauth2Index + 1);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
}
