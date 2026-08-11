/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomStorageObject } from './tokens.types.js';
import type { AsyncLegacyConfigOptions } from './legacy-config.types.js';
import type { ResponseType, AuthDisplayValue, AuthPromptValue } from './authorize.types.js';

export const LOG_LEVEL_VALUES = ['none', 'error', 'warn', 'info', 'debug'] as const;
export type LogLevel = (typeof LOG_LEVEL_VALUES)[number];

export const LOG_LEVEL_UPPERCASE_VALUES = LOG_LEVEL_VALUES.map((v) =>
  v.toUpperCase(),
) as readonly Uppercase<LogLevel>[];

/** Configuration for creating an OIDC client instance. */
export interface OidcConfig extends AsyncLegacyConfigOptions {
  clientId: string;
  redirectUri: string;
  scope: string;
  serverConfig: {
    wellknown: string;
    timeout?: number;
  };
  responseType?: ResponseType;
  /** Use Pushed Authorization Requests (PAR) for the authorization flow. */
  par?: boolean;
  /** URI to redirect to after logout; maps to `post_logout_redirect_uri` in the end-session request. */
  signOutRedirectUri?: string;
  loginHint?: string;
  nonce?: string;
  display?: AuthDisplayValue;
  prompt?: AuthPromptValue;
  uiLocales?: string;
  acrValues?: string;
  query?: Record<string, string>;
  log?: LogLevel;
}

export interface JourneyServerConfig {
  wellknown: string;
  timeout?: number;
}

/**
 * Configuration for creating a journey client instance.
 *
 * Extends {@link AsyncLegacyConfigOptions} so that the same config object can
 * be shared across journey-client, davinci-client, and oidc-client. Properties
 * like `clientId`, `scope`, and `redirectUri` are accepted but not used by
 * journey-client — a warning is logged when they are provided.
 */
export interface JourneyClientConfig extends AsyncLegacyConfigOptions {
  serverConfig: JourneyServerConfig;
  log?: LogLevel;
}

export interface DaVinciConfig extends AsyncLegacyConfigOptions {
  responseType?: string;
  log?: LogLevel;
}

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

interface CustomPathConfig {
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
