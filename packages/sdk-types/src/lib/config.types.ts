import { AsyncServerConfig } from './legacy-config.types.js';
import { TokenStoreObject } from './tokens.types.js';

/**
 * Union of possible OAuth Configs
 * For example, we can add a Journey based OAuth config here
 */
export type OAuthConfig = DavinciOAuthConfig;

export interface DavinciOAuthConfig extends BaseConfig {
  clientId: string;
  tokenStore: TokenStoreObject | 'sessionStorage' | 'localStorage';
  redirectUri: string;
  scope: string;
}

export interface BaseConfig {
  serverConfig: PathsConfig;
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
  paths: CustomPathConfig;
  timeout?: number;
}
