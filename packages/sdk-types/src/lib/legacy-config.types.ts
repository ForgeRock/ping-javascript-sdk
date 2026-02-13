/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/** *************************************************************
 * Legacy configuration options for the SDK
 * **************************************************************/

import type { Callback, CustomPathConfig } from './am-callback.types.js';
import type { LegacyRequestMiddleware } from './legacy-mware.types.js';
import { CustomStorageObject } from './tokens.types.js';

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
 * Async LegacyConfigOptions for well-known endpoint usage
 */
export interface AsyncLegacyConfigOptions extends Omit<LegacyConfigOptions, 'serverConfig'> {
  serverConfig: AsyncServerConfig;
}

/**
 * Optional configuration for custom paths for actions
 */

/**
 * Configuration options with a server configuration specified.
 */
export interface ValidLegacyConfigOptions extends LegacyConfigOptions {
  serverConfig: ServerConfig;
  // needs logger?
}

export interface WellknownResponse {
  issuer: string;
  authorization_endpoint: string;
  pushed_authorization_request_endpoint?: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  ping_end_idp_session_endpoint?: string;
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

type JourneyCallbackFactory = (callback: Callback) => any;

export interface LegacyConfigOptions {
  callbackFactory?: JourneyCallbackFactory;
  clientId?: string;
  middleware?: LegacyRequestMiddleware[];
  realmPath?: string;
  redirectUri?: string;
  scope?: string;
  serverConfig?: ServerConfig;
  tokenStore?: CustomStorageObject | 'sessionStorage' | 'localStorage';
  tree?: string;
  type?: string;
  oauthThreshold?: number;
  platformHeader?: boolean;
  prefix?: string;
}
