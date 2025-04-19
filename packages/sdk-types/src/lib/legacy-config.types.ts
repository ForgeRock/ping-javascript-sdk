/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/** *************************************************************
 * Legacy configuration options for the SDK
 * **************************************************************/

import type { Callback } from './am-callback.types.js';
import type { Tokens } from './tokens.types.js';
import type { LegacyRequestMiddleware } from './legacy-mware.types.js';

/**
 * Async ConfigOptions for well-known endpoint usage
 */
export interface AsyncConfigOptions extends Omit<LegacyConfigOptions, 'serverConfig'> {
  serverConfig: AsyncServerConfig;
}

export type ConfigurablePaths = keyof CustomPathConfig;

/**
 * Optional configuration for custom paths for actions
 */
export interface CustomPathConfig {
  authenticate?: string;
  authorize?: string;
  accessToken?: string;
  endSession?: string;
  userInfo?: string;
  revoke?: string;
  sessions?: string;
}

/**
 * Configuration settings for connecting to a server.
 */
export interface ServerConfig {
  baseUrl: string;
  paths?: CustomPathConfig;
  timeout?: number;
}

/**
 * Configuration settings for async config with well-known
 */
export interface AsyncServerConfig extends Omit<ServerConfig, 'baseUrl'> {
  wellknown?: string;
}

/**
 * API for implementing a custom token store
 */
export interface TokenStoreObject {
  get: (clientId: string) => Promise<Tokens>;
  set: (clientId: string, token: Tokens) => Promise<void>;
  remove: (clientId: string) => Promise<void>;
}

/**
 * Configuration options with a server configuration specified.
 */
export interface ValidConfigOptions extends LegacyConfigOptions {
  serverConfig: ServerConfig;
  // needs logger?
}

/**
 * Represents configuration overrides used when requesting the next
 * step in an authentication tree.
 */
export interface StepOptions extends LegacyConfigOptions {
  query?: Record<string, string>;
}

export interface WellKnownResponse {
  issuer: string;
  authorization_endpoint: string;
  pushed_authorization_request_endpoint?: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  introspection_endpoint: string;
  revocation_endpoint: string;
  jwks_uri?: string;
  device_authorization_endpoint?: string;
  claims_parameter_supported?: boolean;
  request_parameter_supported?: boolean;
  request_uri_parameter_supported?: boolean;
  require_pushed_authorization_requests?: boolean;
  scopes_supported?: string[];
  response_types_supported?: string[];
  response_modes_supported?: string[];
  grant_types_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  userinfo_signing_alg_values_supported?: string[];
  request_object_signing_alg_values_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  token_endpoint_auth_signing_alg_values_supported?: string[];
  claim_types_supported?: string[];
  claims_supported?: string[];
  code_challenge_methods_supported?: string[];
}

type FRCallbackFactory = (callback: Callback) => any;

export interface LegacyConfigOptions {
  callbackFactory?: FRCallbackFactory;
  clientId?: string;
  middleware?: LegacyRequestMiddleware[];
  realmPath?: string;
  redirectUri?: string;
  scope?: string;
  serverConfig?: ServerConfig;
  tokenStore?: TokenStoreObject | 'sessionStorage' | 'localStorage';
  tree?: string;
  type?: string;
  oauthThreshold?: number;
  platformHeader?: boolean;
  prefix?: string;
}
