/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenericError } from '@forgerock/sdk-types';
import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';
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
}

/**
 * Configuration for creating a journey client instance.
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
export interface JourneyClientConfig {
  serverConfig: JourneyServerConfig;
  /** Optional middleware for request customization */
  middleware?: Array<RequestMiddleware>;
}

/**
 * Internal configuration after wellknown discovery and path resolution.
 * Used internally by the journey client — not part of the public API.
 *
 * @internal
 */
export interface InternalJourneyClientConfig {
  serverConfig: ResolvedServerConfig;
  /** Optional middleware for request customization */
  middleware?: Array<RequestMiddleware>;
  error?: GenericError;
}

export type { RequestMiddleware };
