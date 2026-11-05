/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { AuthorizationDetail } from '@forgerock/sdk-types';

import type { OidcConfig } from './config.types.js';

export interface TokenExchangeResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  authorization_details?: AuthorizationDetail[];
}

export interface TokenExchangeErrorResponse {
  error: string;
  message: string;
  type: 'exchange_error' | 'network_error' | 'state_error' | 'unknown_error';
}

export interface TokenRequestOptions {
  code: string;
  config: OidcConfig;
  endpoint: string;
  verifier?: string;
}
