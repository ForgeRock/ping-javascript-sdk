/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { LegacyConfigOptions } from '@forgerock/sdk-types';

/**
 * Define the options for the authorization URL
 * @param clientId The client ID of the application
 * @param redirectUri The redirect URI of the application
 * @param responseType The response type of the authorization request
 * @param scope The scope of the authorization request
 */
export type ResponseType = 'code' | 'token';
export interface GetAuthorizationUrlOptions extends LegacyConfigOptions {
  successParams?: string[];
  errorParams?: string[];

  /**
   * These three properties clientid, scope and redirectUri are required
   * when using this type, which are not required when defining Config.
   */
  clientId: string;
  login?: 'redirect' | 'embedded';
  scope: string;
  redirectUri: string;
  responseType: ResponseType;
  state?: string;
  verifier?: string;
  query?: Record<string, string>;
  prompt?: 'none' | 'login' | 'consent';
}
