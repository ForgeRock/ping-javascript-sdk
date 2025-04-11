/**
 *
 *  Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import {
  getLocalStorageTokens,
  setLocalStorageTokens,
  removeTokensFromLocalStorage,
  tokenFactory,
} from './local-storage.js';
import { TOKEN_ERRORS, type ConfigOptions, type Tokens } from '@forgerock/shared-types';

describe('Token Storage Functions', () => {
  // Mock config
  const mockConfig: ConfigOptions = {
    clientId: 'test-client',
    prefix: 'test-prefix',
  };

  // Sample tokens
  const sampleTokens: Tokens = {
    accessToken: 'access-token-123',
    idToken: 'id-token-456',
    refreshToken: 'refresh-token-789',
    tokenExpiry: 3600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const mockSessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('sessionStorage', mockSessionStorage);
  });

  afterEach(() => {
    // Restore the original implementations after tests
    vi.unstubAllGlobals();
  });

  describe('getLocalStorageTokens', () => {
    it('should return undefined when no tokens exist', () => {
      const tokens = getLocalStorageTokens(mockConfig);

      expect(localStorage.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toEqual({
        error: TOKEN_ERRORS.NO_TOKENS_FOUND_LOCAL_STORAGE,
      });
    });

    it('should parse and return tokens when they exist', () => {
      getLocalStorageTokens(mockConfig);
      expect(localStorage.getItem).toHaveBeenCalledWith('test-prefix-test-client');
    });

    it('should return error object when tokens exist but cannot be parsed', () => {
      const result = getLocalStorageTokens(mockConfig);

      expect(localStorage.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(result).toEqual({ error: TOKEN_ERRORS.NO_TOKENS_FOUND_LOCAL_STORAGE });
    });
  });

  describe('setTokens', () => {
    it('should stringify and store tokens in localStorage', () => {
      setLocalStorageTokens(mockConfig, sampleTokens);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-prefix-test-client',
        JSON.stringify(sampleTokens),
      );
    });
  });

  describe('removeTokens', () => {
    it('should remove tokens from localStorage', () => {
      removeTokensFromLocalStorage(mockConfig);

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-prefix-test-client');
    });
  });

  describe('tokenFactory', () => {
    it('should return an object with get, set, and remove methods', () => {
      const tokenManager = tokenFactory(mockConfig);

      expect(tokenManager).toHaveProperty('get');
      expect(tokenManager).toHaveProperty('set');
      expect(tokenManager).toHaveProperty('remove');
      expect(typeof tokenManager.get).toBe('function');
      expect(typeof tokenManager.set).toBe('function');
      expect(typeof tokenManager.remove).toBe('function');
    });

    it('get method should retrieve tokens', () => {
      (localStorage.getItem as Mock).mockReturnValueOnce(JSON.stringify(sampleTokens));

      const tokenManager = tokenFactory(mockConfig);
      const tokens = tokenManager.get();

      expect(localStorage.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toEqual(sampleTokens);
    });

    it('set method should store tokens', () => {
      const tokenManager = tokenFactory(mockConfig);
      tokenManager.set(sampleTokens);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-prefix-test-client',
        JSON.stringify(sampleTokens),
      );
    });

    it('remove method should remove tokens', () => {
      const tokenManager = tokenFactory(mockConfig);
      tokenManager.remove();

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-prefix-test-client');
    });
  });
});
