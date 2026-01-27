/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Re-export error handling from sdk-oidc (uses RTK Query types)
export { createWellknownError } from '@forgerock/sdk-oidc';

// Re-export URL validation from sdk-utilities (pure utility)
export { isValidWellknownUrl } from '@forgerock/sdk-utilities';

import type { AsyncJourneyClientConfig, JourneyConfigInput } from './config.types.js';

/**
 * Attempts to infer the realm path from a ForgeRock AM issuer URL.
 *
 * AM issuer URLs follow one of two patterns:
 * - Simplified: `https://{host}/am/oauth2/{realm}` (e.g., `/am/oauth2/alpha`)
 * - Legacy: `https://{host}/am/oauth2/realms/root/realms/{realm}`
 *
 * This function extracts the realm from either format.
 * Returns undefined for non-AM issuers (e.g., PingOne, generic OIDC).
 *
 * @param issuer - The issuer URL from the well-known response
 * @returns The inferred realm path, or undefined if it cannot be determined
 *
 * @example
 * ```typescript
 * // Simplified format (common in ForgeBlocks)
 * inferRealmFromIssuer('https://openam-sdks.forgeblocks.com/am/oauth2/alpha')
 * // Returns: 'alpha'
 *
 * // Legacy format with explicit realm path
 * inferRealmFromIssuer('https://am.example.com/am/oauth2/realms/root/realms/alpha')
 * // Returns: 'alpha'
 *
 * // Nested subrealm (legacy format)
 * inferRealmFromIssuer('https://am.example.com/am/oauth2/realms/root/realms/customers/realms/premium')
 * // Returns: 'customers/realms/premium'
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

    // Pattern 1: Legacy subrealm - /oauth2/realms/root/realms/{subrealm}
    const legacySubRealmMatch = pathname.match(/\/oauth2\/realms\/root\/realms\/(.+)$/);
    if (legacySubRealmMatch) {
      return legacySubRealmMatch[1];
    }

    // Pattern 2: Legacy root realm - /oauth2/realms/root
    const legacyRootMatch = pathname.match(/\/oauth2\/realms\/(root)$/);
    if (legacyRootMatch) {
      return legacyRootMatch[1];
    }

    // Pattern 3: Simplified format - /oauth2/{realm} (e.g., /am/oauth2/alpha)
    const simplifiedMatch = pathname.match(/\/oauth2\/([^/]+)$/);
    if (simplifiedMatch) {
      return simplifiedMatch[1];
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Type guard to determine if the configuration includes well-known endpoint discovery.
 *
 * @param config - The journey client configuration (union of sync and async configs)
 * @returns True if the config has a wellknown property in serverConfig
 *
 * @example
 * ```typescript
 * const config: JourneyConfigInput = {
 *   serverConfig: {
 *     baseUrl: 'https://am.example.com/am/',
 *     wellknown: 'https://am.example.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration'
 *   }
 * };
 *
 * if (hasWellknownConfig(config)) {
 *   // TypeScript now knows config is AsyncJourneyClientConfig
 *   const wellknownUrl = config.serverConfig.wellknown;
 * }
 * ```
 */
export function hasWellknownConfig(config: JourneyConfigInput): config is AsyncJourneyClientConfig {
  return (
    'serverConfig' in config &&
    typeof config.serverConfig === 'object' &&
    config.serverConfig !== null &&
    'wellknown' in config.serverConfig &&
    typeof config.serverConfig.wellknown === 'string' &&
    config.serverConfig.wellknown.length > 0
  );
}
