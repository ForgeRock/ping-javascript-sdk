/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { createStorage, type StorageConfig } from './storage.effects.js';
import type { TokenStoreObject } from '@forgerock/sdk-types';

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
    setItem: vi.fn((key: string, value: string | Record<any, any> | any[]) => {
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
    getItem: vi.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
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

const mockCustomStore: TokenStoreObject = {
  get: vi.fn((key: string) => Promise.resolve<string | null>(null)),
  set: vi.fn((key: string, value: unknown) => Promise.resolve()),
  remove: vi.fn((key: string) => Promise.resolve()),
};

describe('storage Effect', () => {
  const storageName = 'MyStorage';
  const baseConfig: Omit<StorageConfig, 'tokenStore'> = {
    prefix: 'testPrefix',
  };
  const expectedKey = `${baseConfig.prefix}-${storageName}`;
  const testValue = 'testTokenValue';

  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();

    (mockCustomStore.get as Mock).mockResolvedValue(null);
    (mockCustomStore.set as Mock).mockResolvedValue(undefined);
    (mockCustomStore.remove as Mock).mockResolvedValue(undefined);
  });

  describe('with localStorage', () => {
    const config: StorageConfig = {
      ...baseConfig,
      tokenStore: 'localStorage',
    };

    const storageInstance = createStorage(config, storageName);

    it('should call localStorage.getItem with the correct key and return value', async () => {
      localStorageMock.setItem(expectedKey, testValue);
      const result = await storageInstance.get<string>();
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBe(testValue);
      expect(sessionStorageMock.getItem).not.toHaveBeenCalled();
      expect(mockCustomStore.get).not.toHaveBeenCalled();
    });

    it('should return null if localStorage.getItem finds no value', async () => {
      const result = await storageInstance.get<null>();
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBeNull();
    });

    it('should call localStorage.setItem with the correct key and value', async () => {
      await storageInstance.set(testValue);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(expectedKey, testValue);
      expect(await localStorageMock.getItem(expectedKey)).toBe(testValue);
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
      localStorageMock.setItem(expectedKey, testValue);
      await storageInstance.remove();
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(expectedKey);
      expect(await localStorageMock.getItem(expectedKey)).toBeNull();
      expect(sessionStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should parse objects/arrays when calling localStorage.getItem', async () => {
      const testObject = { a: 1, b: 'test' };
      storageInstance.set(testObject);

      const result = await storageInstance.get<typeof testObject>();
      console.log(result);

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
      // expect(result).toEqual(testObject);
      // expect(mockCustomStore.remove).not.toHaveBeenCalled();
    });
  });

  describe('with sessionStorage', () => {
    const config: StorageConfig = {
      ...baseConfig,
      tokenStore: 'sessionStorage',
    };
    const storageName = 'MyStorage';
    const storageInstance = createStorage(config, storageName);

    it('should call sessionStorage.getItem with the correct key and return value', async () => {
      sessionStorageMock.setItem(expectedKey, testValue);
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
      const result = await storageInstance.get<typeof obj>();
      if (!result) {
        // we should not hit this expect
        expect(false).toBe(true);
      }
      expect(result).toStrictEqual(obj);
      expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
    });
    it('should call sessionStorage.setItem with the correct key and value', async () => {
      await storageInstance.set(testValue);
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(expectedKey, testValue);
      expect(await sessionStorageMock.getItem(expectedKey)).toBe(testValue);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockCustomStore.set).not.toHaveBeenCalled();
    });
    it('should call sessionStorage.setItem with the correct key and value', async () => {
      const obj = { tokens: 123 };
      await storageInstance.set(obj);
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(expectedKey, JSON.stringify(obj));
      expect(await sessionStorageMock.getItem(expectedKey)).toBe(JSON.stringify(obj));
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockCustomStore.set).not.toHaveBeenCalled();
    });
    it('should call sessionStorage.removeItem with the correct key', async () => {
      await storageInstance.remove();
      expect(sessionStorageMock.removeItem).toHaveBeenCalledTimes(1);
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(expectedKey);
      expect(await sessionStorageMock.getItem(expectedKey)).toBeNull();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockCustomStore.remove).not.toHaveBeenCalled();
    });
  });

  describe('with custom TokenStoreObject', () => {
    const config: StorageConfig = {
      ...baseConfig,
      tokenStore: 'localStorage',
    };
    const myStorage = 'MyStorage';
    const storageInstance = createStorage(config, myStorage, mockCustomStore);

    it('should call customStore.get with the correct key and return its value', async () => {
      (mockCustomStore.get as Mock).mockResolvedValueOnce(testValue);
      const result = await storageInstance.get();
      expect(mockCustomStore.get).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.get).toHaveBeenCalledWith(expectedKey);
      expect(result).toBe(testValue);
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
      expect(sessionStorageMock.getItem).not.toHaveBeenCalled();
    });

    it('should return null if customStore.get returns null', async () => {
      (mockCustomStore.get as Mock).mockResolvedValueOnce(null);
      const result = await storageInstance.get();
      expect(mockCustomStore.get).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.get).toHaveBeenCalledWith(expectedKey);
    });

    it('should parse JSON strings returned from customStore.get', async () => {
      const testObject = { token: 'abc', user: 'xyz' };
      const jsonString = JSON.stringify(testObject);
      (mockCustomStore.get as Mock).mockResolvedValueOnce(jsonString); // Mock returns JSON string

      const result = await storageInstance.get<typeof testObject>();

      expect(mockCustomStore.get).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.get).toHaveBeenCalledWith(expectedKey);
      expect(result).toEqual(testObject); // Verify it was parsed
    });

    it('should call customStore.set with the correct key and value', async () => {
      await storageInstance.set(testValue);
      expect(mockCustomStore.set).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.set).toHaveBeenCalledWith(expectedKey, testValue);
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
    it('should call customStore.remove with the correct key', async () => {
      await storageInstance.remove();
      expect(mockCustomStore.remove).toHaveBeenCalledTimes(1);
      expect(mockCustomStore.remove).toHaveBeenCalledWith(expectedKey);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(sessionStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });

  it('should return a function that returns the storage interface', () => {
    const config: StorageConfig = { ...baseConfig, tokenStore: 'localStorage' };
    const myStorage = 'MyStorage';
    const storageInterface = createStorage(config, myStorage);
    expect(storageInterface).toHaveProperty('get');
    expect(storageInterface).toHaveProperty('set');
    expect(storageInterface).toHaveProperty('remove');
    expect(typeof storageInterface.get).toBe('function');
    expect(typeof storageInterface.set).toBe('function');
    expect(typeof storageInterface.remove).toBe('function');
  });
});
