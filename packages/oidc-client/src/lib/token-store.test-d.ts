import { describe, expectTypeOf, it } from 'vitest';
import { CustomStorageObject, Tokens } from '@forgerock/sdk-types';
import { GenericError, StorageConfig } from '@forgerock/storage';
import { tokenStore } from './token-store.js';

describe('tokenStore type tests', () => {
  const mockTokens: Tokens = {
    accessToken: 'test_access_token',
    idToken: 'test_id_token',
    refreshToken: 'test_refresh',
    tokenExpiry: 3600,
  };
  it('should return a storage object with Tokens type when customStore is not provided', () => {
    const storageConfig: StorageConfig = {
      storeType: 'sessionStorage',
    };
    const store = tokenStore(storageConfig);
    expectTypeOf<Promise<void | { code: string; message: string; type: string }>>(
      store.set(mockTokens),
    );

    expectTypeOf<Promise<void>>(store.remove());
    expectTypeOf<Promise<Tokens | GenericError | null>>(store.get());
    const tokens = store.get();
    if ('accessToken' in tokens) {
      expectTypeOf<Promise<Tokens>>();
    }
  });

  it('should return a storage object with Tokens type when customStore is provided', () => {
    const storageConfig: StorageConfig = {
      storeType: 'sessionStorage',
    };
    const customStore: CustomStorageObject = {
      get: async (key: string) => {
        return key;
      },
      set: async (key: string, value: any) => {
        console.log(key, value);
      },
      remove: async (key: string) => {
        console.log(key);
      },
    };
    const store = tokenStore(storageConfig, customStore);
    expectTypeOf<Promise<Tokens | GenericError | null>>(store.get());
    expectTypeOf<Promise<void | { code: string; message: string; type: string }>>(
      store.set(mockTokens),
    );
    expectTypeOf<Promise<void>>(store.remove());
  });
});
