import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';

export interface GetTokensOptions {
  authorizeOptions?: GetAuthorizationUrlOptions;
  backgroundRenew?: boolean;
  forceRenew?: boolean;
  storageOptions?: Partial<StorageConfig>;
}

export type RevokeSuccessResult = {
  revokeResponse: null;
  deleteResponse: null;
};

export type RevokeErrorResult = {
  error: string;
  revokeResponse: GenericError | null;
  deleteResponse: GenericError | null;
};

export type LogoutSuccessResult = RevokeSuccessResult & {
  sessionResponse: null;
};

export type LogoutErrorResult = {
  error: string;
  sessionResponse: GenericError | null;
  revokeResponse: GenericError | null;
  deleteResponse: GenericError | null;
};

export type UserInfoResponse = {
  sub: string;
  [key: string]: unknown;
};
