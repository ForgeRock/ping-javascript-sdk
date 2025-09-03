import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';

export interface GetTokensOptions {
  authorizeOptions?: GetAuthorizationUrlOptions;
  backgroundRenew?: boolean;
  forceRenew?: boolean;
  storageOptions?: Partial<StorageConfig>;
}

export type LogoutResult = Promise<
  | GenericError
  | {
      sessionResponse: GenericError | null;
      revokeResponse: GenericError | null;
      deleteResponse: GenericError | null;
    }
>;
