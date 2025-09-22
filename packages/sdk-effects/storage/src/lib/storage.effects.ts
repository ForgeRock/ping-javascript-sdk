/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomStorageObject, GenericError } from '@forgerock/sdk-types';

export interface StorageClient<Value> {
  get: () => Promise<Value | GenericError | null>;
  set: (value: Value) => Promise<GenericError | null>;
  remove: () => Promise<GenericError | null>;
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

function createStorageError(
  storeType: 'localStorage' | 'sessionStorage' | 'custom',
  action: 'Storing' | 'Retrieving' | 'Removing' | 'Parsing',
): GenericError {
  let storageName;
  switch (storeType) {
    case 'localStorage':
      storageName = 'local';
      break;
    case 'sessionStorage':
      storageName = 'session';
      break;
    case 'custom':
      storageName = 'custom';
      break;
    default:
      break;
  }

  return {
    error: `${action}_error`,
    message: `Error ${action.toLowerCase()} value from ${storageName} storage`,
    type: action === 'Parsing' ? 'parse_error' : 'unknown_error',
  };
}

export function createStorage<Value>(config: StorageConfig): StorageClient<Value> {
  const { type: storeType, prefix = 'pic', name } = config;
  const key = `${prefix}-${name}`;
  const storageTypes = {
    sessionStorage,
    localStorage,
  };

  if (storeType === 'custom' && !('custom' in config)) {
    throw new Error('Custom storage configuration must include a custom storage object');
  }

  return {
    get: async function storageGet(): Promise<Value | GenericError | null> {
      if (storeType === 'custom') {
        const value = await config.custom.get(key);
        if (value === null || (typeof value === 'object' && 'error' in value)) {
          return value;
        }

        try {
          const parsed = JSON.parse(value);
          return parsed as Value;
        } catch {
          return createStorageError(storeType, 'Parsing');
        }
      }

      let value: string | null;
      try {
        value = await storageTypes[storeType].getItem(key);
        if (value === null) {
          return value;
        }
      } catch {
        return createStorageError(storeType, 'Retrieving');
      }

      try {
        const parsed = JSON.parse(value);
        return parsed as Value;
      } catch {
        return createStorageError(storeType, 'Parsing');
      }
    },
    set: async function storageSet(value: Value): Promise<GenericError | null> {
      const valueToStore = JSON.stringify(value);
      if (storeType === 'custom') {
        const value = await config.custom.set(key, valueToStore);
        return Promise.resolve(value ?? null);
      }

      try {
        await storageTypes[storeType].setItem(key, valueToStore);
        return Promise.resolve(null);
      } catch {
        return createStorageError(storeType, 'Storing');
      }
    },
    remove: async function storageRemove(): Promise<GenericError | null> {
      if (storeType === 'custom') {
        const value = await config.custom.remove(key);
        return Promise.resolve(value ?? null);
      }

      try {
        await storageTypes[storeType].removeItem(key);
        return Promise.resolve(null);
      } catch {
        return createStorageError(storeType, 'Removing');
      }
    },
  } as StorageClient<Value>;
}
