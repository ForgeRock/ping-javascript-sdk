/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomStorageObject } from './tokens.types.js';

/**
 * Union of possible OAuth Configs
 * For example, we can add a Journey based OAuth config here
 */
export type OAuthConfig = DavinciOAuthConfig;

export interface DavinciOAuthConfig extends BaseConfig {
  clientId: string;
  tokenStore: CustomStorageObject | 'sessionStorage' | 'localStorage';
  redirectUri: string;
  scope: string;
}

export interface BaseConfig {
  serverConfig?: PathsConfig;
}

export interface CustomPathConfig {
  authenticate: string;
  authorize: string;
  accessToken: string;
  endSession: string;
  userInfo: string;
  revoke: string;
  sessions: string;
}
/**
 * Configuration settings for connecting to a server.
 */
export interface PathsConfig {
  baseUrl: string;
  paths?: CustomPathConfig;
  timeout?: number;
}
