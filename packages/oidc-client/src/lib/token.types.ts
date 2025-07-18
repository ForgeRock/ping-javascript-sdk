import { OidcConfig } from './config.types.js';

export interface TokenExchangeResponse {
  token: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType?: string;
}

export interface TokenRequestOptions {
  code: string;
  config: OidcConfig;
  endpoint: string;
  verifier?: string;
}
