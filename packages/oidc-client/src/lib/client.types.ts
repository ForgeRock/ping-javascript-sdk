/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { SdkStoreHandle } from '@forgerock/sdk-store';
import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';

import type { oidc } from './client.store.js';
import type { OidcRootState } from './client.store.utils.js';

export type OidcClient = Awaited<ReturnType<typeof oidc>>;

/**
 * The inner Redux store. OIDC contributes its root state through the SDK store
 * handle; internal code only needs the Redux store itself.
 */
export type ClientStore = SdkStoreHandle<OidcRootState>['store'];

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
