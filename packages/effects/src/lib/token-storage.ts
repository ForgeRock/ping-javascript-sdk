import type { ConfigOptions, TokensError, TokenStoreObject } from '@forgerock/shared-types';
import type { Tokens } from '@forgerock/shared-types';

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

// Add near top of file
export function isTokenError(value: unknown): value is TokensError {
  return typeof value === 'object' && value !== null && 'error' in value;
}

export type TokenStoreType = 'localStorage' | 'sessionStorage' | 'custom';

export function isValidTokenStore(store: unknown): store is TokenStoreType {
  return store === 'localStorage' || store === 'sessionStorage' || store === 'custom';
}

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
): Promise<ReturnType<typeof getSessionStorage> | ReturnType<typeof getLocalStorageTokens>>;
// Asynchronous overload
export async function getTokens(
  config: ConfigOptions,
): Promise<ReturnType<typeof getSessionStorage> | ReturnType<typeof getLocalStorageTokens>>;
// Implementation
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

// Overload 1: Sync-compatible (but still returns Promise)
export function setTokens(tokens: Tokens, config: ConfigOptions): Promise<void>;
// Overload 2: Async-only (with TokenStore)
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
      return { error: 'Sync mode requires localStorage/sessionStorage.' };
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
// Overload 1: Sync-compatible (but still returns Promise)
export async function removeTokens(config: ConfigOptions): Promise<void | TokensError>;
// Overload 2: Async-only (with TokenStore)
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
        error: 'Invalid token store type. Expected "localStorage" or "sessionStorage".',
      });
    }
  } else {
    if (!config.clientId) {
      return Promise.resolve({
        error: 'Client ID is required. Please pass in a config with a client id to removeTokens',
      });
    }
    return await tokenStore.remove(config.clientId);
  }
}

// Optionally, create a factory function to maintain API compatibility
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
