import { OidcConfig } from './config.types.js';

export interface TokenExchangeResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface TokenExchangeErrorResponse {
  error: string;
  message: string;
  type: 'exchange_error' | 'network_error' | 'unknown_error';
}

export interface TokenRequestOptions {
  code: string;
  config: OidcConfig;
  endpoint: string;
  verifier?: string;
}
