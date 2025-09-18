/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  generateAndStoreAuthUrlValues,
  getStorageKey,
  getStoredAuthUrlValues,
} from './state-pkce.effects.js';
import type { GenerateAndStoreAuthUrlValues } from '@forgerock/sdk-types';

const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

describe('PKCE', () => {
  beforeEach(() => {
    if (typeof sessionStorage === 'undefined') {
      global.sessionStorage = mockSessionStorage;
    }

    sessionStorage.clear();
  });

  const mockOptions: GenerateAndStoreAuthUrlValues = {
    clientId: 'test-client',
    redirectUri: 'http://localhost:8080',
    scope: 'openid profile',
    responseType: 'code',
  };

  describe('getStorageKey', () => {
    const clientId = 'test-client-id';

    it('should generate storage key with default prefix', () => {
      const key = getStorageKey(clientId);
      expect(key).toBe('FR-SDK-authflow-test-client-id');
    });

    it('should generate storage key with custom prefix', () => {
      const customPrefix = 'CUSTOM';
      const key = getStorageKey(clientId, customPrefix);
      expect(key).toBe('CUSTOM-authflow-test-client-id');
    });
  });

  describe('generateAndStoreAuthUrlValues', () => {
    it('should generate PKCE values', () => {
      const [options] = generateAndStoreAuthUrlValues(mockOptions);

      expect(options).toBeDefined();
      expect(options).toHaveProperty('state');
      expect(options).toHaveProperty('verifier');
    });

    it('should store options in sessionStorage when storage function is called', () => {
      const [options, storeAuthUrl] = generateAndStoreAuthUrlValues(mockOptions);
      storeAuthUrl();

      const storageKey = getStorageKey(mockOptions.clientId, mockOptions.prefix);
      const storedValue = sessionStorage.getItem(storageKey);
      expect(storedValue).toBeDefined();

      const parsedValue = JSON.parse(storedValue as string);
      expect(parsedValue).toEqual(options);
    });
  });

  describe('getStoredAuthUrlValues', () => {
    it('should retrieve and parse stored values', () => {
      const [options, storeAuthUrl] = generateAndStoreAuthUrlValues(mockOptions);
      storeAuthUrl();

      const storedValues = getStoredAuthUrlValues(mockOptions.clientId, mockOptions.prefix);
      expect(storedValues).toEqual(options);
    });

    it('should remove values from storage after retrieval', () => {
      const [, storeAuthUrl] = generateAndStoreAuthUrlValues(mockOptions);
      storeAuthUrl();

      const storageKey = getStorageKey(mockOptions.clientId, mockOptions.prefix);

      // Verify value exists before retrieval
      expect(sessionStorage.getItem(storageKey)).toBeDefined();

      // Retrieve values
      getStoredAuthUrlValues(mockOptions.clientId, mockOptions.prefix);

      // Verify value was removed
      expect(sessionStorage.getItem(storageKey)).toBeNull();
    });

    it('should throw error when stored values cannot be parsed', () => {
      const storageKey = getStorageKey(mockOptions.clientId, mockOptions.prefix);
      sessionStorage.setItem(storageKey, 'invalid json');

      expect(() => getStoredAuthUrlValues(mockOptions.clientId, mockOptions.prefix)).toThrow(
        'Stored values for Auth URL could not be parsed',
      );
    });
  });
});
