/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { SerializedError } from '@reduxjs/toolkit';
import type { GenericError } from '@forgerock/sdk-types';

import { isGenericError } from '../error/error.utils.js';

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
 * Validates that a well-known URL is properly formatted.
 *
 * @param wellknownUrl - The URL to validate
 * @returns True if the URL is a valid wellknown URL and uses HTTPS (or HTTP for localhost)
 *
 * @example
 * ```typescript
 * isValidWellknownUrl('https://am.example.com/.well-known/openid-configuration')
 * // Returns: true
 *
 * isValidWellknownUrl('http://localhost:8080/.well-known/openid-configuration')
 * // Returns: true (localhost allows HTTP)
 *
 * isValidWellknownUrl('http://am.example.com/.well-known/openid-configuration')
 * // Returns: false (non-localhost requires HTTPS)
 *
 * isValidWellknownUrl('not-a-url')
 * // Returns: false
 * ```
 */
export function isValidWellknownUrl(wellknownUrl: string): boolean {
  try {
    const url = new URL(wellknownUrl);

    // Make sure the URL ends with the expected path defined here: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
    if (!url.pathname.endsWith('/.well-known/openid-configuration')) {
      return false;
    }

    // Allow HTTP only for localhost (development)
    // Note: We intentionally do not check for IPv6 localhost (::1) as it is rarely used
    // in local development and adds complexity. Most dev servers bind to localhost or 127.0.0.1.
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isSecure = url.protocol === 'https:';
    const isHttpLocalhost = url.protocol === 'http:' && isLocalhost;

    return isSecure || isHttpLocalhost;
  } catch {
    return false;
  }
}
