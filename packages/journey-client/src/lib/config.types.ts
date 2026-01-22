/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { BaseConfig, WellKnownResponse, PathsConfig } from '@forgerock/sdk-types';
import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';

/**
 * Standard journey client configuration with explicit baseUrl.
 *
 * Use this when you want to configure the AM server directly without
 * OIDC well-known endpoint discovery.
 *
 * @example
 * ```typescript
 * const config: JourneyClientConfig = {
 *   serverConfig: {
 *     baseUrl: 'https://am.example.com/am/',
 *   },
 *   realmPath: 'alpha',
 * };
 * ```
 */
export interface JourneyClientConfig extends BaseConfig {
  middleware?: Array<RequestMiddleware>;
  realmPath?: string;
}

/**
 * Server configuration that includes well-known OIDC endpoint discovery.
 *
 * When wellknown is provided, the client will fetch the OIDC discovery
 * document to obtain endpoints like authorization, token, userinfo, etc.
 *
 * Note: baseUrl is still required for AM-specific endpoints (authenticate,
 * sessions) which are not part of the standard OIDC well-known response.
 */
export interface WellknownServerConfig {
  /** Base URL for AM-specific endpoints (authenticate, sessions) */
  baseUrl: string;
  /** URL to the OIDC well-known configuration endpoint */
  wellknown: string;
  /** Custom path overrides for endpoints */
  paths?: PathsConfig['paths'];
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Journey client configuration with OIDC well-known endpoint discovery.
 *
 * This configuration fetches the OIDC discovery document to obtain
 * standard OIDC endpoints while still using baseUrl for AM-specific
 * journey endpoints.
 *
 * @example
 * ```typescript
 * const config: AsyncJourneyClientConfig = {
 *   serverConfig: {
 *     baseUrl: 'https://am.example.com/am/',
 *     wellknown: 'https://am.example.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
 *   },
 *   // realmPath is optional - can be inferred from the well-known issuer
 * };
 * ```
 */
export interface AsyncJourneyClientConfig {
  serverConfig: WellknownServerConfig;
  middleware?: Array<RequestMiddleware>;
  /** Optional realm path - can be inferred from well-known issuer if not provided */
  realmPath?: string;
}

/**
 * Internal configuration type that includes the resolved well-known response.
 *
 * This type is used internally after the well-known endpoint has been fetched
 * and the configuration has been normalized.
 */
export interface InternalJourneyClientConfig extends JourneyClientConfig {
  /** The fetched OIDC well-known response, if wellknown discovery was used */
  wellknownResponse?: WellKnownResponse;
}

/**
 * Union type for journey client initialization.
 *
 * Accepts either a standard configuration with baseUrl only,
 * or an async configuration with well-known endpoint discovery.
 */
export type JourneyConfigInput = JourneyClientConfig | AsyncJourneyClientConfig;

export type { RequestMiddleware };
