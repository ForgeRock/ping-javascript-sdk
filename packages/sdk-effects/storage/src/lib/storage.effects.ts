/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomStorageObject } from '@forgerock/sdk-types';

export interface StorageConfig {
  storeType: CustomStorageObject | 'localStorage' | 'sessionStorage';
  prefix?: string;
}

interface GenericError {
  code?: string | number;
  message: string;
  type:
    | 'argument_error'
    | 'davinci_error'
    | 'internal_error'
    | 'network_error'
    | 'state_error'
    | 'unknown_error';
}

export function createStorage<Value>(
  config: StorageConfig,
  storageName: string,
  customStore?: CustomStorageObject,
) {
  const { storeType, prefix = 'pic' } = config;

  const key = `${prefix}-${storageName}`;
  return {
    get: async function storageGet(): Promise<Value | GenericError | null> {
      if (customStore) {
        const value = await customStore.get(key);
        if (value === null) {
          return value;
        }
        try {
          const parsed = JSON.parse(value);
          return parsed as Value;
        } catch {
          return {
            code: 'Parse_Error',
            message: 'Eror parsing value from provided storage',
            type: 'unknown_error',
          };
        }
      }
      if (storeType === 'sessionStorage') {
        const value = await sessionStorage.getItem(key);
        if (value === null) {
          return value;
        }
        try {
          const parsed = JSON.parse(value);
          return parsed as Value;
        } catch {
          return {
            code: 'Parse_Error',
            message: 'Eror parsing value from session storage',
            type: 'unknown_error',
          };
        }
      }
      const value = await localStorage.getItem(key);

      if (value === null) {
        return value;
      }
      try {
        const parsed = JSON.parse(value);
        return parsed as Value;
      } catch {
        return {
          code: 'Parse_Error',
          message: 'Eror parsing value from local storage',
          type: 'unknown_error',
        };
      }
    },
    set: async function storageSet(value: Value) {
      const valueToStore = JSON.stringify(value);
      if (customStore) {
        try {
          await customStore.set(key, valueToStore);
          return Promise.resolve();
        } catch {
          return {
            code: 'Storing_Error',
            message: 'Eror storing value in custom storage',
            type: 'unknown_error',
          };
        }
      }
      if (storeType === 'sessionStorage') {
        try {
          await sessionStorage.setItem(key, valueToStore);
          return Promise.resolve();
        } catch {
          return {
            code: 'Storing_Error',
            message: 'Eror storing value in session storage',
            type: 'unknown_error',
          };
        }
      }
      try {
        await localStorage.setItem(key, valueToStore);
        return Promise.resolve();
      } catch {
        return {
          code: 'Storing_Error',
          message: 'Eror storing value in local storage',
          type: 'unknown_error',
        };
      }
    },
    remove: async function storageSet() {
      if (customStore) {
        return await customStore.remove(key);
      }
      if (storeType === 'sessionStorage') {
        return await sessionStorage.removeItem(key);
      }
      return await localStorage.removeItem(key);
    },
  };
}
