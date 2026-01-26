/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Re-export shared wellknown utilities from sdk-oidc
export {
  createWellknownError,
  inferRealmFromIssuer,
  isValidWellknownUrl,
} from '@forgerock/sdk-oidc';

import type { AsyncJourneyClientConfig, JourneyConfigInput } from './config.types.js';

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
