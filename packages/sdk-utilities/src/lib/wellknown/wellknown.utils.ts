/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Attempts to infer the realm path from an OIDC issuer URL.
 *
 * AM issuer URLs follow the pattern:
 * `https://{host}/am/oauth2/realms/root/realms/{subrealm}`
 *
 * This function extracts the realm path after `/realms/root/realms/`.
 * If the issuer doesn't match the expected pattern, returns undefined.
 *
 * @param issuer - The issuer URL from the well-known response
 * @returns The inferred realm path, or undefined if it cannot be determined
 *
 * @example
 * ```typescript
 * // Standard AM issuer with subrealm
 * inferRealmFromIssuer('https://am.example.com/am/oauth2/realms/root/realms/alpha')
 * // Returns: 'alpha'
 *
 * // Nested subrealm
 * inferRealmFromIssuer('https://am.example.com/am/oauth2/realms/root/realms/customers/realms/premium')
 * // Returns: 'customers/realms/premium'
 *
 * // Root realm only
 * inferRealmFromIssuer('https://am.example.com/am/oauth2/realms/root')
 * // Returns: 'root'
 *
 * // Non-AM issuer (e.g., PingOne)
 * inferRealmFromIssuer('https://auth.pingone.com/env-id/as')
 * // Returns: undefined
 * ```
 */
export function inferRealmFromIssuer(issuer: string): string | undefined {
  try {
    const url = new URL(issuer);
    const pathname = url.pathname;

    // Pattern 1: Subrealm - /oauth2/realms/root/realms/{subrealm}
    const subRealmMatch = pathname.match(/\/oauth2\/realms\/root\/realms\/(.+)$/);
    if (subRealmMatch) {
      return subRealmMatch[1];
    }

    // Pattern 2: Root realm only - /oauth2/realms/root
    const rootRealmMatch = pathname.match(/\/oauth2\/realms\/(root)$/);
    if (rootRealmMatch) {
      return rootRealmMatch[1];
    }

    // Could not infer realm from issuer URL
    return undefined;
  } catch {
    // Invalid URL - return undefined
    return undefined;
  }
}

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
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isSecure = url.protocol === 'https:';
    const isHttpLocalhost = url.protocol === 'http:' && isLocalhost;

    return isSecure || isHttpLocalhost;
  } catch {
    return false;
  }
}
