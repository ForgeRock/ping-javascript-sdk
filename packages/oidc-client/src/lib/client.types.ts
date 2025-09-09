import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';

export interface GetTokensOptions {
  authorizeOptions?: GetAuthorizationUrlOptions;
  backgroundRenew?: boolean;
  forceRenew?: boolean;
  storageOptions?: Partial<StorageConfig>;
}

export type RevokeSuccessResult = {
  revokeResponse: GenericError | null;
  deleteResponse: GenericError | null;
};

export type RevokeErrorResult = RevokeSuccessResult & {
  error: string;
};

export type LogoutSuccessResult = RevokeSuccessResult & {
  sessionResponse: GenericError | null;
};

export type LogoutErrorResult = LogoutSuccessResult & {
  error: string;
};

export type UserInfoResponse = {
  sub: string;
  [key: string]: unknown;
};
