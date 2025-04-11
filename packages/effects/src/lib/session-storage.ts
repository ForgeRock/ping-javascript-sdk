/*
 * Copyright (c) 2025 Ping Identity Corporation.

 * All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { ConfigOptions, Tokens } from '@forgerock/shared-types';

export function getSessionStorage(config: ConfigOptions) {
  const tokenString = sessionStorage.getItem(`${config.prefix}-${config.clientId}`);
  if (!tokenString) {
    return {
      error: 'No token found in sessionStorage',
    };
  }
  try {
    const tokens = JSON.parse(tokenString) as Tokens;
    return tokens;
  } catch (err) {
    return {
      error: 'Could not parse token from sessionStorage',
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
