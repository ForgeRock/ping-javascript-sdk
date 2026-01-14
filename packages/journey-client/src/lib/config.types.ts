/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { WellknownResponse, PathsConfig } from '@forgerock/sdk-types';
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
  /** Optional custom path overrides */
  paths?: PathsConfig['paths'];
  /** Optional request timeout in milliseconds */
  timeout?: number;
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
  /** Optional realm path - inferred from wellknown issuer if not provided */
  realmPath?: string;
}

/**
 * Internal configuration after wellknown discovery and resolution.
 * Used internally by the journey client - not part of public API.
 *
 * @internal
 */
export interface InternalJourneyClientConfig {
  serverConfig: {
    /** Resolved base URL (required after inference) */
    baseUrl: string;
    /** Optional custom path overrides */
    paths?: PathsConfig['paths'];
    /** Optional request timeout in milliseconds */
    timeout?: number;
  };
  /** Optional middleware for request customization */
  middleware?: Array<RequestMiddleware>;
  /** Resolved realm path */
  realmPath?: string;
  /** Cached wellknown response */
  wellknownResponse: WellknownResponse;
}

export type { RequestMiddleware };
