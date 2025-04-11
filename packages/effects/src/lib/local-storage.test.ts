/**
 *
 *  Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getLocalStorageTokens,
  setLocalStorageTokens,
  removeTokensFromLocalStorage,
  tokenFactory,
} from './local-storage.js';
import type { ConfigOptions, Tokens } from '@forgerock/shared-types';

// Create a mock global object for tests
const createMockWindow = () => {
  const localStorageMock = {
    getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock.store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock.store[key];
    }),
    clear: vi.fn(() => {
      localStorageMock.store = {};
    }),
    store: {} as Record<string, string>,
  };
  return localStorageMock;
};

describe('Token Storage Functions', () => {
  let localStorageMock: ReturnType<typeof createMockWindow>;

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
    // Setup mock localStorage
    localStorageMock = createMockWindow();

    // Mock the localStorage globally
    vi.stubGlobal('localStorage', localStorageMock);

    // Clear mock calls before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore the original implementations after tests
    vi.unstubAllGlobals();
  });

  describe('getLocalStorageTokens', () => {
    it('should return undefined when no tokens exist', () => {
      const tokens = getLocalStorageTokens(mockConfig);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toBeUndefined();
    });

    it('should parse and return tokens when they exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(sampleTokens));

      const tokens = getLocalStorageTokens(mockConfig);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toEqual(sampleTokens);
    });

    it('should return error object when tokens exist but cannot be parsed', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');

      const result = getLocalStorageTokens(mockConfig);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(result).toEqual({ error: 'Could not parse token from localStorage' });
    });
  });

  describe('setTokens', () => {
    it('should stringify and store tokens in localStorage', () => {
      setLocalStorageTokens(mockConfig, sampleTokens);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-prefix-test-client',
        JSON.stringify(sampleTokens),
      );
    });
  });

  describe('removeTokens', () => {
    it('should remove tokens from localStorage', () => {
      removeTokensFromLocalStorage(mockConfig);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-prefix-test-client');
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
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(sampleTokens));

      const tokenManager = tokenFactory(mockConfig);
      const tokens = tokenManager.get();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toEqual(sampleTokens);
    });

    it('set method should store tokens', () => {
      const tokenManager = tokenFactory(mockConfig);
      tokenManager.set(sampleTokens);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-prefix-test-client',
        JSON.stringify(sampleTokens),
      );
    });

    it('remove method should remove tokens', () => {
      const tokenManager = tokenFactory(mockConfig);
      tokenManager.remove();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-prefix-test-client');
    });
  });
});
