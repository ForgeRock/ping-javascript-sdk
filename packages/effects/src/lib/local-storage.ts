/**
 *
 *  Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import type { ConfigOptions, Tokens } from '@forgerock/shared-types';

export function getLocalStorageTokens(Config: ConfigOptions) {
  const tokenString = localStorage.getItem(`${Config.prefix}-${Config.clientId}`);
  if (!tokenString) {
    return;
  }
  try {
    const tokens = JSON.parse(tokenString);
    return tokens;
  } catch (err) {
    return {
      error: 'Could not parse token from localStorage',
    };
  }
}

export function setLocalStorageTokens(Config: ConfigOptions, tokens: Tokens) {
  const tokenString = JSON.stringify(tokens);
  localStorage.setItem(`${Config.prefix}-${Config.clientId}`, tokenString);
}

export function removeTokensFromLocalStorage(Config: ConfigOptions) {
  localStorage.removeItem(`${Config.prefix}-${Config.clientId}`);
}

export function tokenFactory(config: ConfigOptions) {
  return {
    get: () => getLocalStorageTokens(config),
    set: (tokens: Tokens) => setLocalStorageTokens(config, tokens),
    remove: () => removeTokensFromLocalStorage(config),
  };
}
