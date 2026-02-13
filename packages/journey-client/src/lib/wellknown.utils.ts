/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { WellknownResponse } from '@forgerock/sdk-types';

/**
 * Resolved server configuration derived from a well-known response.
 */
export interface ResolvedServerConfig {
  baseUrl: string;
  paths: {
    authenticate: string;
    sessions: string;
  };
}

/**
 * Derives the internal server configuration from an OIDC well-known response.
 *
 * ForgeRock AM uses a consistent URL pattern where the `issuer` contains
 * `/oauth2/` and the corresponding JSON API endpoints use `/json/` in the
 * same position. This function exploits that convention:
 *
 * - `baseUrl`: extracted from the `authorization_endpoint` origin
 * - `authenticate` path: issuer path with `oauth2` replaced by `json`, plus `/authenticate`
 * - `sessions` path: issuer path with `oauth2` replaced by `json`, plus `/sessions/`
 *
 * @param data - The well-known response from the OIDC discovery endpoint
 * @returns The resolved server configuration with baseUrl and pre-computed paths
 * @throws When `authorization_endpoint` is missing or the issuer doesn't contain `/oauth2`
 *
 * @example
 * ```typescript
 * const config = convertWellknown({
 *   issuer: 'https://am.example.com/am/oauth2/alpha',
 *   authorization_endpoint: 'https://am.example.com/am/oauth2/alpha/authorize',
 *   token_endpoint: 'https://am.example.com/am/oauth2/alpha/access_token',
 *   // ...
 * });
 * // Returns:
 * // {
 * //   baseUrl: 'https://am.example.com',
 * //   paths: {
 * //     authenticate: '/am/json/alpha/authenticate',
 * //     sessions: '/am/json/alpha/sessions/',
 * //   },
 * // }
 * ```
 */
export function convertWellknown(data: WellknownResponse): ResolvedServerConfig {
  if (!data.authorization_endpoint) {
    throw new Error('Well-known response is missing authorization_endpoint');
  }

  const authEndpoint = new URL(data.authorization_endpoint);
  const baseUrl = authEndpoint.origin;

  const issuerUrl = new URL(data.issuer);
  const issuerPath = issuerUrl.pathname;

  if (!issuerPath.includes('/oauth2')) {
    throw new Error(
      'Journey-client requires a ForgeRock AM issuer containing "/oauth2" in the path. ' +
        `Received issuer: ${data.issuer}. ` +
        'For PingOne or other OIDC providers, use davinci-client or oidc-client instead.',
    );
  }

  const jsonPath = issuerPath.replace('/oauth2', '/json');
  const authenticate = `${jsonPath}/authenticate`;
  const sessions = `${jsonPath}/sessions/`;

  return {
    baseUrl,
    paths: { authenticate, sessions },
  };
}
