import { CustomStorageObject, Tokens } from '@forgerock/sdk-types';
import { createStorage, StorageConfig } from '@forgerock/storage';

export const tokenStore = (storage: StorageConfig, customStore?: CustomStorageObject) => {
  if (customStore) {
    return createStorage<Tokens>(storage, 'tokenStore', customStore);
  } else {
    return createStorage<Tokens>(storage, 'tokenStore');
  }
};
