import type { ConfigOptions, TokensError, TokenStoreObject } from '@forgerock/shared-types';
import type { Tokens } from '@forgerock/shared-types';
import { TOKEN_ERRORS } from '@forgerock/shared-types';

import {
  getSessionStorage,
  removeKeyFromSessionStorage,
  setSessionStorage,
} from './session-storage.js';
import {
  getLocalStorageTokens,
  removeTokensFromLocalStorage,
  setLocalStorageTokens,
} from './local-storage.js';

export type TokenStoreType = 'localStorage' | 'sessionStorage' | 'custom';

/**
 * Gets tokens from the specified storage.
 * @param config - Configuration options including clientId and storage type
 * @param tokenStore - Optional custom token store implementation
 * @returns Promise resolving to tokens or error
 * @throws Never - Returns errors as objects instead
 */
export async function getTokens(
  config: ConfigOptions,
  tokenStore: TokenStoreObject,
): Promise<Tokens | TokensError>;
export async function getTokens(config: ConfigOptions): Promise<Tokens | TokensError>;
export async function getTokens(
  config: ConfigOptions,
  maybeTokenStore?: TokenStoreObject,
): Promise<Tokens | TokensError> {
  if (maybeTokenStore) {
    const clientId = config.clientId;
    if (!clientId) {
      return Promise.resolve({ error: 'Client ID is required.' });
    }
    return maybeTokenStore.get(clientId);
  }

  const tokenStore = config.tokenStore;

  switch (tokenStore) {
    case 'sessionStorage':
      return getSessionStorage(config);
    case 'localStorage':
      return getLocalStorageTokens(config);
    default:
      return getLocalStorageTokens(config);
  }
}

export function setTokens(tokens: Tokens, config: ConfigOptions): Promise<void>;
export function setTokens(
  tokens: Tokens,
  config: ConfigOptions,
  tokenStore: TokenStoreObject,
): Promise<void | TokensError>;
export async function setTokens(
  tokens: Tokens,
  config: ConfigOptions,
  tokenStore?: TokenStoreObject,
): Promise<void | TokensError> {
  if (tokenStore) {
    if (!config.clientId) {
      return { error: 'Client ID is required.' };
    }
    await tokenStore.set(config.clientId, tokens);
  } else {
    // Enforce sync-compatible config at runtime
    if (config.tokenStore !== 'localStorage' && config.tokenStore !== 'sessionStorage') {
      return { error: TOKEN_ERRORS.INVALID_STORE };
    }
    // Wrap sync ops in Promise.resolve for consistency
    if (config.tokenStore === 'sessionStorage') {
      await Promise.resolve(setSessionStorage(config, tokens));
    } else {
      await Promise.resolve(setLocalStorageTokens(config, tokens));
    }
  }
}
/**
 * Removes stored tokens.
 */
export async function removeTokens(config: ConfigOptions): Promise<void | TokensError>;
export async function removeTokens(
  config: ConfigOptions,
  tokenStore: TokenStoreObject,
): Promise<void | TokensError>;
export async function removeTokens(
  config: ConfigOptions,
  tokenStore?: TokenStoreObject,
): Promise<void | TokensError> {
  if (!tokenStore) {
    if (config.tokenStore === 'sessionStorage') {
      return await removeKeyFromSessionStorage(config);
    } else if (config.tokenStore === 'localStorage') {
      return await removeTokensFromLocalStorage(config);
    } else {
      return Promise.resolve({
        error: TOKEN_ERRORS.INVALID_STORE,
      });
    }
  } else {
    if (!config.clientId) {
      return Promise.resolve({
        error: TOKEN_ERRORS.CLIENT_ID_REQUIRED,
      });
    }
    return await tokenStore.remove(config.clientId);
  }
}

export function tokenStorageFactory(config: ConfigOptions): TokenStoreObject {
  return {
    get: async (clientId: string) => getTokens({ ...config, clientId }),
    set: async (clientId: string, tokens: Tokens) => setTokens(tokens, { ...config, clientId }),
    remove: async (clientId: string) => removeTokens({ ...config, clientId }),
  };
}

// Default export for backward compatibility
export default {
  get: getTokens,
  set: setTokens,
  remove: removeTokens,
};
