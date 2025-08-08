/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomStorageObject, GenericError } from '@forgerock/sdk-types';

export interface StorageClient<Value> {
  get: () => Promise<Value | GenericError | null>;
  set: (value: Value) => Promise<void | {
    code: string;
    message: string;
    type: string;
  }>;
  remove: () => Promise<void>;
}

export type StorageConfig = BrowserStorageConfig | CustomStorageConfig;

export interface BrowserStorageConfig {
  type: 'localStorage' | 'sessionStorage';
  prefix?: string;
  name: string;
}

export interface CustomStorageConfig {
  type: 'custom';
  prefix?: string;
  name: string;
  custom: CustomStorageObject;
}

export function createStorage<Value>(config: StorageConfig) {
  const { type: storeType, prefix = 'pic', name } = config;

  if (storeType === 'custom' && !('custom' in config)) {
    throw new Error('Custom storage configuration must include a custom storage object');
  }

  const key = `${prefix}-${name}`;
  return {
    get: async function storageGet(): Promise<Value | GenericError | null> {
      if ('custom' in config) {
        const value = await config.custom.get(key);
        if (value === null) {
          return value;
        }
        try {
          const parsed = JSON.parse(value);
          return parsed as Value;
        } catch {
          return {
            error: 'Parse_Error',
            message: 'Error parsing value from provided storage',
            type: 'parse_error',
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
            error: 'Parse_Error',
            message: 'Error parsing value from session storage',
            type: 'parse_error',
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
          error: 'Parse_Error',
          message: 'Error parsing value from local storage',
          type: 'parse_error',
        };
      }
    },
    set: async function storageSet(value: Value) {
      const valueToStore = JSON.stringify(value);
      if ('custom' in config) {
        try {
          await config.custom.set(key, valueToStore);
          return Promise.resolve();
        } catch {
          return {
            code: 'Storing_Error',
            message: 'Error storing value in custom storage',
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
            message: 'Error storing value in session storage',
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
          message: 'Error storing value in local storage',
          type: 'unknown_error',
        };
      }
    },
    remove: async function storageSet() {
      if ('custom' in config) {
        return await config.custom.remove(key);
      }
      if (storeType === 'sessionStorage') {
        return await sessionStorage.removeItem(key);
      }
      return await localStorage.removeItem(key);
    },
  };
}
