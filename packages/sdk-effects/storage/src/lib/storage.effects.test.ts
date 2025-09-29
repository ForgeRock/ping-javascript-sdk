/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorage, type StorageConfig } from './storage.effects.js';
import type { CustomStorageObject, GenericError } from '@forgerock/sdk-types';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => {
      const value = store[key];
      if (value === undefined || value === null) {
        return Promise.resolve(null);
      }
      return Promise.resolve(value);
    }),
    setItem: vi.fn((key: string, value: unknown) => {
      const valueIsString = typeof value === 'string';
      store[key] = valueIsString ? value : JSON.stringify(value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: () => {
      store = {};
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
    },
    key: (index: number) => Promise.resolve(Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => {
      const value = store[key];
      if (value === undefined || value === null) {
        return Promise.resolve(null);
      }
      return Promise.resolve(JSON.parse(value));
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = JSON.stringify(value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: () => {
      store = {};
      sessionStorageMock.getItem.mockClear();
      sessionStorageMock.setItem.mockClear();
      sessionStorageMock.removeItem.mockClear();
    },
    key: (index: number) => Promise.resolve(Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock });

let customStore: Record<string, string> = {};
const mockCustomStore: CustomStorageObject = {
  get: vi.fn(async (key: string): Promise<string | GenericError> => {
    const keys = Object.keys(customStore);
    if (!keys.includes(key)) {
      return {
        error: 'Retrieving_error',
        message: 'Key not found',
        type: 'unknown_error',
      };
    }
    return customStore[key];
  }),
  set: vi.fn(async (key: string, valueToSet: unknown): Promise<void | GenericError> => {
    if (valueToSet === `"bad-value"` || typeof valueToSet !== 'string') {
      return {
        error: 'Storing_error',
        message: 'Value is bad',
        type: 'unknown_error',
      };
    }
    customStore[key] = valueToSet;
  }),
  remove: vi.fn(async (key: string): Promise<void | GenericError> => {
    const keys = Object.keys(customStore);
    if (!keys.includes(key)) {
      return {
        error: 'Removing_error',
        message: 'Key not found',
        type: 'unknown_error',
      };
    }
    delete customStore[key];
  }),
};

describe('storage Effect', () => {
  const storageName = 'MyStorage';
  const baseConfig: Omit<StorageConfig, 'tokenStore'> = {
    type: 'localStorage',
    name: storageName,
    prefix: 'testPrefix',
  };
  const expectedKey = `${baseConfig.prefix}-${storageName}`;
  const testValue = 'testTokenValue';

  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();

    customStore = {};
  });

  describe('with localStorage', () => {
    const config: StorageConfig = {
      ...baseConfig,
      name: storageName,
      type: 'localStorage',
    };

    const storageInstance = createStorage(config);

    it('should call localStorage.getItem with the correct key and return value', async () => {
      await localStorageMock.setItem(expectedKey, JSON.stringify(testValue));
      const result = await storageInstance.get();
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBe(testValue);
      expect(sessionStorageMock.getItem).not.toHaveBeenCalled();
      expect(mockCustomStore.get).not.toHaveBeenCalled();
    });

    it('should return null if localStorage.getItem finds no value', async () => {
      const result = await storageInstance.get();
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBeNull();
    });

    it('should call localStorage.setItem with the correct key and value', async () => {
      const result = await storageInstance.set(testValue);
      expect(result).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(expectedKey, JSON.stringify(testValue));
      expect(await localStorageMock.getItem(expectedKey)).toBe(JSON.stringify(testValue));
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockCustomStore.set).not.toHaveBeenCalled();
    });

    it('should stringify objects/arrays when calling localStorage.setItem', async () => {
      const testObject = { a: 1, b: 'test' };
      await storageInstance.set(testObject);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify(testObject),
      );
    });

    it('should call localStorage.removeItem with the correct key', async () => {
      await localStorageMock.setItem(expectedKey, testValue);
      const result = await storageInstance.remove();
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(expectedKey);
      expect(await localStorageMock.getItem(expectedKey)).toBeNull();
      expect(sessionStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should parse objects/arrays when calling localStorage.getItem', async () => {
      const testObject = { a: 1, b: 'test' };
      await storageInstance.set(testObject);

      const result = await storageInstance.get();

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toEqual(testObject);
      expect(mockCustomStore.remove).not.toHaveBeenCalled();
    });
  });

  describe('with sessionStorage', () => {
    const storageName = 'MyStorage';
    const config: StorageConfig = {
      ...baseConfig,
      name: storageName,
      type: 'sessionStorage',
    };
    const storageInstance = createStorage(config);

    it('should call sessionStorage.getItem with the correct key and return value', async () => {
      await sessionStorageMock.setItem(expectedKey, JSON.stringify(testValue));
      const result = await storageInstance.get();
      expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toEqual(testValue);
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
      expect(mockCustomStore.get).not.toHaveBeenCalled();
    });

    it('should return null if sessionStorage.getItem finds no value', async () => {
      const result = await storageInstance.get();
      expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBeNull();
    });
    it('should return parsed value if sessionStorage.getItem returns object or array', async () => {
      const obj = { tokens: 123 };
      await storageInstance.set(obj);
      const result = await storageInstance.get();

      expect(result).toStrictEqual(obj);
      expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
    });
    it('should call sessionStorage.setItem with the correct key and value', async () => {
      const result = await storageInstance.set(testValue);
      expect(result).toBeNull();
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify(testValue),
      );
      expect(await sessionStorageMock.getItem(expectedKey)).toBe(JSON.stringify(testValue));
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockCustomStore.set).not.toHaveBeenCalled();
    });
    it('should call sessionStorage.setItem with the correct key and value and stringify objects', async () => {
      const obj = { tokens: 123 };
      const result = await storageInstance.set(obj);
      expect(result).toBeNull();
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(expectedKey, JSON.stringify(obj));
      expect(await sessionStorageMock.getItem(expectedKey)).toBe(JSON.stringify(obj));
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockCustomStore.set).not.toHaveBeenCalled();
    });
    it('should call sessionStorage.removeItem with the correct key', async () => {
      const result = await storageInstance.remove();
      expect(result).toBeNull();
      expect(sessionStorageMock.removeItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(expectedKey);
      expect(await sessionStorageMock.getItem(expectedKey)).toBeNull();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockCustomStore.remove).not.toHaveBeenCalled();
    });
  });

  describe('with custom storage', () => {
    const config: StorageConfig = {
      ...baseConfig,
      type: 'custom',
      custom: mockCustomStore,
    };
    const storageInstance = createStorage(config);

    it('should call customStore.get with the correct key and return its value', async () => {
      await storageInstance.set(testValue);
      const result = await storageInstance.get();
      expect(mockCustomStore.get).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.get).toHaveBeenCalledWith(expectedKey);
      expect(result).toBe(testValue);
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
      expect(sessionStorageMock.getItem).not.toHaveBeenCalled();
    });

    it('should parse objects/arrays returned from customStore.get', async () => {
      const testObject = { token: 'abc', user: 'xyz' };
      await storageInstance.set(testObject);

      const result = await storageInstance.get();

      expect(mockCustomStore.get).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.get).toHaveBeenCalledWith(expectedKey);
      expect(result).toEqual(testObject); // Verify it was parsed
    });

    it('should return an error if customStore.get errors', async () => {
      const result = await storageInstance.get();
      expect(result).toStrictEqual({
        error: 'Retrieving_error',
        message: 'Key not found',
        type: 'unknown_error',
      });
      expect(mockCustomStore.get).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.get).toHaveBeenCalledWith(expectedKey);
    });

    it('should call customStore.set with the correct key and value', async () => {
      const result = await storageInstance.set(testValue);
      expect(result).toBeNull();
      expect(mockCustomStore.set).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.set).toHaveBeenCalledWith(expectedKey, JSON.stringify(testValue));
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should call customStore.set with the correct key and value and stringify objects', async () => {
      await storageInstance.set({ test: { tokens: '123' } });
      expect(mockCustomStore.set).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.set).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify({ test: { tokens: '123' } }),
      );
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should return an error if customStore.set errors', async () => {
      const result = await storageInstance.set('bad-value');
      expect(result).toStrictEqual({
        error: 'Storing_error',
        message: 'Value is bad',
        type: 'unknown_error',
      });
      expect(mockCustomStore.set).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.set).toHaveBeenCalledWith(expectedKey, JSON.stringify('bad-value'));
    });

    it('should call customStore.remove with the correct key', async () => {
      await storageInstance.set(testValue);
      const result = await storageInstance.remove();
      expect(result).toBeNull();
      expect(mockCustomStore.remove).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.remove).toHaveBeenCalledWith(expectedKey);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(sessionStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should return an error if customStore.remove errors', async () => {
      const result = await storageInstance.remove();
      expect(result).toStrictEqual({
        error: 'Removing_error',
        message: 'Key not found',
        type: 'unknown_error',
      });
      expect(mockCustomStore.remove).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.remove).toHaveBeenCalledWith(expectedKey);
    });
  });

  it('should return a function that returns the storage interface', () => {
    const config: StorageConfig = { ...baseConfig, type: 'localStorage' };
    const storageInterface = createStorage(config);
    expect(storageInterface).toHaveProperty('get');
    expect(storageInterface).toHaveProperty('set');
    expect(storageInterface).toHaveProperty('remove');
    expect(typeof storageInterface.get).toBe('function');
    expect(typeof storageInterface.set).toBe('function');
    expect(typeof storageInterface.remove).toBe('function');
  });
});
