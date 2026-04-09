/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { AsyncLegacyConfigOptions, GenericError } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';
import type { ResolvedServerConfig } from './wellknown.utils.js';

/**
 * Server configuration for journey-client.
 *
 * Only the OIDC discovery endpoint URL is required. All other configuration
 * (baseUrl, paths) is automatically derived from the well-known response.
 */
export interface JourneyServerConfig {
  /** Required OIDC discovery endpoint URL */
  wellknown: string;
  /** Optional request timeout in milliseconds. Included for config-sharing compatibility with other clients. */
  timeout?: number;
}

/**
 * Configuration for creating a journey client instance.
 *
 * Extends {@link AsyncLegacyConfigOptions} so that the same config object can
 * be shared across journey-client, davinci-client, and oidc-client. Properties
 * like `clientId`, `scope`, and `redirectUri` are accepted but not used by
 * journey-client — a warning is logged when they are provided.
 *
 * @example
 * ```typescript
 * const config: JourneyClientConfig = {
 *   serverConfig: {
 *     wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
 *   },
 * };
 * ```
 */
export interface JourneyClientConfig extends AsyncLegacyConfigOptions {
  serverConfig: JourneyServerConfig;
  /** Storage configuration for step persistence during redirects. Defaults to sessionStorage in browsers. */
  storage?: StorageConfig;
}

/**
 * Internal configuration after wellknown discovery and path resolution.
 * Used internally by the journey client — not part of the public API.
 *
 * @internal
 */
export interface InternalJourneyClientConfig {
  serverConfig: ResolvedServerConfig;
  error?: GenericError;
}
