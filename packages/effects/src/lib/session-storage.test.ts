/*
 * Copyright (c) 2025 Ping Identity Corporation.
 * All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSessionStorage,
  setSessionStorage,
  removeKeyFromSessionStorage,
  sessionStorageFactory,
} from './session-storage.js';
import { TOKEN_ERRORS, type ConfigOptions, type Tokens } from '@forgerock/shared-types';

// Create a mock sessionStorage object for tests
const createMockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: vi.fn((key: string) => sessionStorageMock.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      sessionStorageMock.store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete sessionStorageMock.store[key];
    }),
    clear: vi.fn(() => {
      sessionStorageMock.store = {};
    }),
    store: {} as Record<string, string>,
  };
  return sessionStorageMock;
};

describe('Session Token Storage Functions', () => {
  let sessionStorageMock: ReturnType<typeof createMockSessionStorage>;

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
    // Setup mock sessionStorage
    sessionStorageMock = createMockSessionStorage();

    // Mock the sessionStorage globally
    vi.stubGlobal('sessionStorage', sessionStorageMock);

    // Clear mock calls before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore the original implementations after tests
    vi.unstubAllGlobals();
  });

  describe('getSessionStorage', () => {
    it('should return undefined when no tokens exist', () => {
      const tokens = getSessionStorage(mockConfig);

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toEqual({ error: TOKEN_ERRORS.NO_TOKENS_FOUND_SESSION_STORAGE });
    });

    it('should parse and return tokens when they exist', () => {
      // This test will actually fail because there's a bug in the implementation
      // The parsed tokens are not returned in the getSessionStorage function
      sessionStorageMock.getItem.mockReturnValueOnce(JSON.stringify(sampleTokens));

      const tokens = getSessionStorage(mockConfig);

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      // This will fail because of the bug, but we're keeping it to show the issue
      expect(tokens).toEqual(sampleTokens);
    });

    it('should return error object when tokens exist but cannot be parsed', () => {
      sessionStorageMock.getItem.mockReturnValueOnce('invalid-json');

      const result = getSessionStorage(mockConfig);

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(result).toEqual({ error: TOKEN_ERRORS.PARSE_SESSION_STORAGE });
    });
  });

  describe('setSessionStorage', () => {
    it('should stringify and store tokens in sessionStorage', () => {
      setSessionStorage(mockConfig, sampleTokens);

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'test-prefix-test-client',
        JSON.stringify(sampleTokens),
      );
    });
  });

  describe('removeKeyFromSessionStorage', () => {
    it('should remove tokens from sessionStorage', () => {
      removeKeyFromSessionStorage(mockConfig);

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('test-prefix-test-client');
    });
  });

  describe('sessionStorageFactory', () => {
    it('should return an object with get, set, and remove methods', () => {
      const tokenManager = sessionStorageFactory(mockConfig);

      expect(tokenManager).toHaveProperty('get');
      expect(tokenManager).toHaveProperty('set');
      expect(tokenManager).toHaveProperty('remove');
      expect(typeof tokenManager.get).toBe('function');
      expect(typeof tokenManager.set).toBe('function');
      expect(typeof tokenManager.remove).toBe('function');
    });

    it('get method should retrieve tokens', () => {
      // This will also fail due to the bug in getSessionStorage
      sessionStorageMock.getItem.mockReturnValueOnce(JSON.stringify(sampleTokens));

      const tokenManager = sessionStorageFactory(mockConfig);
      const tokens = tokenManager.get();

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('test-prefix-test-client');
      expect(tokens).toEqual(sampleTokens);
    });

    it('set method should store tokens', () => {
      const tokenManager = sessionStorageFactory(mockConfig);
      tokenManager.set(sampleTokens);

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'test-prefix-test-client',
        JSON.stringify(sampleTokens),
      );
    });

    it('remove method should remove tokens', () => {
      const tokenManager = sessionStorageFactory(mockConfig);
      tokenManager.remove();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('test-prefix-test-client');
    });
  });
});
