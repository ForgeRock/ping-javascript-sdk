import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';

export interface GetTokensOptions {
  backgroundRenew?: boolean;
  authorizeOptions?: GetAuthorizationUrlOptions;
  storageOptions?: Partial<StorageConfig>;
}

export type RevokeResult = {
  isError: boolean;
  revokeResponse: GenericError | null;
  deleteResponse: void;
};

export type LogoutResult = RevokeResult & {
  sessionResponse: GenericError | null;
};

export type UserInfoResponse = {
  sub: string;
  [key: string]: unknown;
};
