/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Validates that a well-known URL is properly formatted.
 *
 * @param wellknownUrl - The URL to validate
 * @returns True if the URL is valid and uses HTTPS (or HTTP for localhost)
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
