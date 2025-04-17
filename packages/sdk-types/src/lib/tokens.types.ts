/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { TOKEN_ERRORS } from './tokens.derived.js';

export interface Tokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
}

export interface TokensError {
  error: TOKEN_ERRORS;
}

/**
 * API for implementing a custom token store
 */
export interface TokenStoreObject {
  get: (clientId: string) => Promise<Tokens | TokensError>;
  set: (clientId: string, token: Tokens) => Promise<void>;
  remove: (clientId: string) => Promise<void | TokensError>;
}
