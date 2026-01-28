/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export { createWellknownError } from '@forgerock/sdk-oidc';
export { isValidWellknownUrl } from '@forgerock/sdk-utilities';

import type { AsyncJourneyClientConfig, JourneyConfigInput } from './config.types.js';

const REALM_PATTERNS = [
  /\/oauth2\/realms\/root\/realms\/(.+)$/, // Legacy subrealm: /oauth2/realms/root/realms/{realm}
  /\/oauth2\/realms\/(root)$/, // Legacy root: /oauth2/realms/root
  /\/oauth2\/([^/]+)$/, // Simplified: /oauth2/{realm}
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
 * Type guard to check if config uses well-known endpoint discovery.
 */
export function hasWellknownConfig(config: JourneyConfigInput): config is AsyncJourneyClientConfig {
  return (
    'serverConfig' in config &&
    typeof config.serverConfig === 'object' &&
    config.serverConfig !== null &&
    'baseUrl' in config.serverConfig &&
    typeof config.serverConfig.baseUrl === 'string' &&
    config.serverConfig.baseUrl.length > 0 &&
    'wellknown' in config.serverConfig &&
    typeof config.serverConfig.wellknown === 'string' &&
    config.serverConfig.wellknown.length > 0
  );
}
