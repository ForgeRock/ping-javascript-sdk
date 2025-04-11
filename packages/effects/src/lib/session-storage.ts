/*
 * Copyright (c) 2025 Ping Identity Corporation.

 * All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { ConfigOptions, Tokens } from '@forgerock/shared-types';
import { TOKEN_ERRORS } from '@forgerock/shared-types';

export function getSessionStorage(config: ConfigOptions) {
  const tokenString = sessionStorage.getItem(`${config.prefix}-${config.clientId}`);
  if (!tokenString) {
    return {
      error: TOKEN_ERRORS.NO_TOKENS_FOUND_SESSION_STORAGE,
    };
  }
  try {
    const tokens = JSON.parse(tokenString) as Tokens;
    return tokens;
  } catch {
    return {
      error: TOKEN_ERRORS.PARSE_SESSION_STORAGE,
    };
  }
}

export function setSessionStorage(config: ConfigOptions, tokens: Tokens) {
  const tokenString = JSON.stringify(tokens);
  sessionStorage.setItem(`${config.prefix}-${config.clientId}`, tokenString);
}

export function removeKeyFromSessionStorage(config: ConfigOptions) {
  sessionStorage.removeItem(`${config.prefix}-${config.clientId}`);
}

export function sessionStorageFactory(config: ConfigOptions) {
  return {
    get: () => getSessionStorage(config),
    set: (tokens: Tokens) => setSessionStorage(config, tokens),
    remove: () => removeKeyFromSessionStorage(config),
  };
}
