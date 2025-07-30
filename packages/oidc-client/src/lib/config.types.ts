/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { AsyncLegacyConfigOptions, WellKnownResponse } from '@forgerock/sdk-types';

export interface OidcConfig extends AsyncLegacyConfigOptions {
  clientId: string;
  redirectUri: string;
  scope: string;
  serverConfig: {
    wellknown: string;
    timeout?: number;
  };
  responseType?: 'code' | 'token';
}

export interface InternalDaVinciConfig extends OidcConfig {
  wellknownResponse: WellKnownResponse;
}

export interface OauthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt?: number;
}
