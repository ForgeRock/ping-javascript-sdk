import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TOKEN_ERRORS,
  type ConfigOptions,
  type TokenStoreObject,
  type Tokens,
} from '@forgerock/shared-types';
import { getTokens, setTokens, removeTokens, tokenStorageFactory } from './token-storage.js';
import * as sessionStorage from './session-storage.js';
import * as localStorage from './local-storage.js';

// Mock the storage modules
vi.mock('./session-storage.js', () => ({
  getSessionStorage: vi.fn(),
  setSessionStorage: vi.fn(),
  removeKeyFromSessionStorage: vi.fn(),
}));

vi.mock('./local-storage.js', () => ({
  getLocalStorageTokens: vi.fn(),
  setLocalStorageTokens: vi.fn(),
  removeTokensFromLocalStorage: vi.fn(),
}));

describe('token-storage', () => {
  const mockTokens: Tokens = { accessToken: 'test-access-token' };
  const mockConfig: ConfigOptions = {
    clientId: 'test-client',
    tokenStore: 'localStorage' as const,
  };

  // Fix: Update mockTokenStore to match TokenStoreObject interface exactly
  const mockTokenStore: TokenStoreObject = {
    get: vi.fn().mockImplementation(async (_clientId: string) => mockTokens),
    set: vi.fn().mockImplementation(async (_clientId: string, _tokens: Tokens) => undefined),
    remove: vi.fn().mockImplementation(async (_clientId: string) => undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTokens', () => {
    it('should get tokens from custom tokenStore when provided', async () => {
      const result = await getTokens(mockConfig, mockTokenStore);
      expect(result).toEqual(mockTokens);
      expect(mockTokenStore.get).toHaveBeenCalledWith('test-client');
    });

    // Fix: Update configWithoutClientId to use correct type
    it('should return error when clientId is missing with custom tokenStore', async () => {
      const configWithoutClientId: ConfigOptions = {
        tokenStore: {
          get: mockTokenStore.get,
          set: mockTokenStore.set,
          remove: mockTokenStore.remove,
        },
      };
      const result = await getTokens(configWithoutClientId, mockTokenStore);
      expect(result).toEqual({ error: TOKEN_ERRORS.CLIENT_ID_REQUIRED });
    });

    it('should use localStorage by default', async () => {
      const configWithoutStore: ConfigOptions = { clientId: 'test-client' };
      await getTokens(configWithoutStore);
      expect(localStorage.getLocalStorageTokens).toHaveBeenCalledWith(configWithoutStore);
    });

    it('should use sessionStorage when specified', async () => {
      const sessionConfig: ConfigOptions = {
        clientId: 'test-client',
        tokenStore: 'sessionStorage',
      };
      await getTokens(sessionConfig);
      expect(sessionStorage.getSessionStorage).toHaveBeenCalledWith(sessionConfig);
    });
  });

  describe('setTokens', () => {
    it('should set tokens in custom tokenStore', async () => {
      const result = await setTokens(mockTokens, mockConfig, mockTokenStore);
      expect(result).toBeUndefined();
      expect(mockTokenStore.set).toHaveBeenCalledWith('test-client', mockTokens);
    });

    // Fix: Update configWithoutClientId to use correct type
    it('should return error when clientId is missing with custom tokenStore', async () => {
      const configWithoutClientId: ConfigOptions = {
        tokenStore: {
          get: mockTokenStore.get,
          set: mockTokenStore.set,
          remove: mockTokenStore.remove,
        },
      };
      const result = await setTokens(mockTokens, configWithoutClientId, mockTokenStore);
      expect(result).toEqual({ error: TOKEN_ERRORS.CLIENT_ID_REQUIRED });
    });

    it('should use localStorage when specified', async () => {
      await setTokens(mockTokens, mockConfig);
      expect(localStorage.setLocalStorageTokens).toHaveBeenCalledWith(mockConfig, mockTokens);
    });

    it('should use sessionStorage when specified', async () => {
      const sessionConfig: ConfigOptions = {
        clientId: 'test-client',
        tokenStore: 'sessionStorage',
      };
      await setTokens(mockTokens, sessionConfig);
      expect(sessionStorage.setSessionStorage).toHaveBeenCalledWith(sessionConfig, mockTokens);
    });
  });

  describe('removeTokens', () => {
    it('should remove tokens from custom tokenStore', async () => {
      const result = await removeTokens(mockConfig, mockTokenStore);
      expect(result).toBeUndefined();
      expect(mockTokenStore.remove).toHaveBeenCalledWith('test-client');
    });

    // Fix: Update configWithoutClientId to use correct type
    it('should return error when clientId is missing with custom tokenStore', async () => {
      const configWithoutClientId: ConfigOptions = {
        tokenStore: {
          get: mockTokenStore.get,
          set: mockTokenStore.set,
          remove: mockTokenStore.remove,
        },
      };
      const result = await removeTokens(configWithoutClientId, mockTokenStore);
      expect(result).toEqual({ error: TOKEN_ERRORS.CLIENT_ID_REQUIRED });
    });

    it('should use localStorage when specified', async () => {
      await removeTokens(mockConfig);
      expect(localStorage.removeTokensFromLocalStorage).toHaveBeenCalledWith(mockConfig);
    });

    it('should use sessionStorage when specified', async () => {
      const sessionConfig: ConfigOptions = {
        clientId: 'test-client',
        tokenStore: 'sessionStorage',
      };
      await removeTokens(sessionConfig);
      expect(sessionStorage.removeKeyFromSessionStorage).toHaveBeenCalledWith(sessionConfig);
    });

    it('should return error for invalid token store type', async () => {
      const invalidConfig: ConfigOptions = {
        clientId: 'test-client',
        // @ts-expect-error: Testing invalid tokenStore type
        tokenStore: 'invalid',
      };
      const result = await removeTokens(invalidConfig);
      expect(result).toEqual({
        error: TOKEN_ERRORS.INVALID_STORE,
      });
    });
  });

  describe('tokenStorageFactory', () => {
    it('should return an object with get, set, and remove methods', () => {
      const tokenStorage = tokenStorageFactory(mockConfig);
      expect(tokenStorage).toHaveProperty('get');
      expect(tokenStorage).toHaveProperty('set');
      expect(tokenStorage).toHaveProperty('remove');
      expect(typeof tokenStorage.get).toBe('function');
      expect(typeof tokenStorage.set).toBe('function');
      expect(typeof tokenStorage.remove).toBe('function');
    });
  });
});
