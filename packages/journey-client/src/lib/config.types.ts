/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { CustomPathConfig } from '@forgerock/sdk-types';
import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';

/**
 * Server configuration for journey-client.
 *
 * @remarks
 * The `wellknown` URL is required for OIDC discovery. The `baseUrl` is
 * automatically inferred from the wellknown URL for ForgeRock AM servers.
 */
export interface JourneyServerConfig {
  /** Required OIDC discovery endpoint URL */
  wellknown: string;
  /** Optional request timeout in milliseconds */
  // timeout?: number; TODO: Add timeout support in future iteration if needed
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
 *   // realmPath is optional - can be inferred from the well-known issuer
 * };
 * ```
 */
export interface JourneyClientConfig {
  serverConfig: JourneyServerConfig;
  /** Optional middleware for request customization */
  middleware?: Array<RequestMiddleware>;
}

/**
 * Internal configuration used within the journey client after resolving the well-known response.
 */
export interface InternalJourneyClientConfig {
  serverConfig: {
    baseUrl: string;
    paths?: Pick<CustomPathConfig, 'authenticate' | 'sessions'>;
  };
  middleware?: Array<RequestMiddleware>;
}

export type { RequestMiddleware };
