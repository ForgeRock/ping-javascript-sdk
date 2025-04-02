import { TokenStoreObject } from '@forgerock/sdk-types';

export interface StorageConfig {
  tokenStore: TokenStoreObject | 'localStorage' | 'sessionStorage';
  prefix: string;
}

export function createStorage(
  config: StorageConfig,
  storageName: string,
  customTokenStore?: TokenStoreObject,
) {
  const { tokenStore, prefix } = config;

  const key = `${prefix}-${storageName}`;
  return {
    get: async function storageGet<ReturnValue>(): Promise<ReturnValue | string | null> {
      if (customTokenStore) {
        const value = await customTokenStore.get(key);
        if (value === null) {
          return value;
        }
        if (value.startsWith('[') || value.startsWith('{')) {
          const parsed = JSON.parse(value);
          return parsed as ReturnValue;
        }
        return value;
      }
      if (tokenStore === 'sessionStorage') {
        const value = await sessionStorage.getItem(key);
        if (value === null) {
          return value;
        }
        if (value.startsWith('[') || value.startsWith('{')) {
          const parsed = JSON.parse(value);
          return parsed as ReturnValue;
        }
        return value;
      }
      const value = await localStorage.getItem(key);

      if (value === null) {
        return value;
      }

      if (value.startsWith('[') || value.startsWith('{')) {
        const parsed = JSON.parse(value);
        return parsed as ReturnValue;
      }
      return value;
    },
    set: async function storageSet(value: string | Record<any, any> | any[]) {
      const valueIsString = typeof value === 'string';
      const valueToStore = valueIsString ? value : JSON.stringify(value);

      if (customTokenStore) {
        return await customTokenStore.set(key, valueToStore);
      }
      if (tokenStore === 'sessionStorage') {
        return await sessionStorage.setItem(key, valueToStore);
      }
      return await localStorage.setItem(key, valueToStore);
    },
    remove: async function storageSet() {
      if (customTokenStore) {
        return await customTokenStore.remove(key);
      }
      if (tokenStore === 'sessionStorage') {
        return await sessionStorage.removeItem(key);
      }
      return await localStorage.removeItem(key);
    },
  };
}
