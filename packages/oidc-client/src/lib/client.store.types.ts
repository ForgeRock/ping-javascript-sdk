import { CustomStorageObject } from '@forgerock/sdk-types';

export interface TokenExchangeOptions {
  prefix?: string;
  customStorage: CustomStorageObject;
}
