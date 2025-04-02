/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export interface Tokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
}

/**
 * API for implementing a custom token store
 */
export interface TokenStoreObject {
  get: (key: string) => Promise<string | null>;
  set: (key: string, valueToSet: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
}
