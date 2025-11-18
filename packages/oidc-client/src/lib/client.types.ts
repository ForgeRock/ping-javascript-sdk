/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';
import { createClientStore } from './client.store.utils.js';

export type ClientStore = ReturnType<typeof createClientStore>;

export type RootState = ReturnType<ClientStore['getState']>;

export type AppDispatch = ReturnType<ClientStore['dispatch']>;

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
