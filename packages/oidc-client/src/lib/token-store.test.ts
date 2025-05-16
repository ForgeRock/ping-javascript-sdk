import { vi } from 'vitest';
import { tokenStore } from './token-store.js';
import { createStorage, StorageConfig } from '@forgerock/storage';

vi.mock('@forgerock/storage', () => {
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  return {
    createStorage: vi.fn(() => mockStorage),
  };
});

describe('tokenStore', () => {
  const storageConfig = {
    storeType: 'sessionStorage',
  } as StorageConfig;

  it('should call createStorage with the correct arguments when customStore is not provided', () => {
    tokenStore(storageConfig);
    expect(createStorage).toHaveBeenCalledWith(storageConfig, 'tokenStore');
  });

  it('should call createStorage with the correct arguments when customStore is provided', () => {
    const customStore = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    };

    tokenStore(storageConfig, customStore);
    expect(createStorage).toHaveBeenCalledWith(storageConfig, 'tokenStore', customStore);
  });
});
