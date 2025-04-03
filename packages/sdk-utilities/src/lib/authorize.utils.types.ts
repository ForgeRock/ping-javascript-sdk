/**
 *
 * Copyright © 2025 Ping Identity Corporation
 *
 **/

import { CustomPathConfig } from './url.utils.types';

/**
 * Define the options for the authorization URL
 * @param clientId The client ID of the application
 * @param redirectUri The redirect URI of the application
 * @param responseType The response type of the authorization request
 * @param scope The scope of the authorization request
 */
export interface CreateAuthorizeUrlOptions {
  clientId: string;
  login: 'redirect';
  redirectUri: string;
  responseType: string;
  scope: string;
}

/**
 * Specifies the type of OAuth flow to invoke.
 */
export enum ResponseType {
  Code = 'code',
  Token = 'token',
}

interface ServerConfig {
  baseUrl: string;
  paths?: CustomPathConfig;
  timeout?: number;
}

interface ConfigOptions {
  clientId?: string;
  serverConfig?: ServerConfig;
  //   callbackFactory?: FRCallbackFactory;
  //   middleware?: RequestMiddleware[];
  //   realmPath?: string;
  redirectUri?: string;
  scope?: string;
  //   tokenStore?: TokenStoreObject | 'sessionStorage' | 'localStorage';
  //   tree?: string;
  //   type?: string;
  //   oauthThreshold?: number;
  //   logLevel?: LogLevel;
  //   logger?: LoggerFunctions;
  //   platformHeader?: boolean;
  prefix?: string;
}

/**
 * Options used when requesting the authorization URL.
 */
interface GetAuthorizationUrlOptions extends ConfigOptions {
  responseType: ResponseType;
  state?: string;
  verifier?: string;
  query?: { [name: string]: string };
  prompt?: 'none' | 'login' | 'consent';
}

export interface GenerateAndStoreAuthUrlValues extends GetAuthorizationUrlOptions {
  clientId: string;
  login?: 'redirect' | 'embedded';
  prefix?: string;
}
