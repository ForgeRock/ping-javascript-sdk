/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { logger as loggerFn } from '@forgerock/sdk-logger';

import { combineSlices, type SerializedError } from '@reduxjs/toolkit';
import { oidcApi } from './oidc.api.js';
import { createSdkStore, injectClient, wellknownApi } from '@forgerock/sdk-store';

import type { GenericError } from '@forgerock/sdk-types';
import type { SdkStore, SdkStoreHandle } from '@forgerock/sdk-store';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * The canonical description of the state this client contributes.
 *
 * The runtime store is assembled by `injectClient`, which TypeScript cannot
 * follow across lazy injection. Combining the same slices here lets the state
 * type be *derived* from them rather than hand-written, so it cannot drift from
 * what is actually mounted. Exported so the derived state type resolves for
 * consumers, and so an application can compose the reducer itself if it wants.
 */
export const rootReducer = combineSlices(oidcApi, wellknownApi);

export type OidcRootState = ReturnType<typeof rootReducer>;

/**
 * @function createClientStore
 * @description Creates, or attaches to, the store backing an OIDC client.
 * @param param - Configuration options for the client store.
 * @param {RequestMiddleware} param.requestMiddleware - Request middleware applied to this client's requests only.
 * @param {ReturnType<typeof loggerFn>} param.logger - An optional logger for this client only.
 * @param {SdkStore} param.store - An existing SDK store to attach to. Omit to create one.
 * @returns {SdkStoreHandle<OidcRootState>} - A handle to the store this client is mounted on.
 */
export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
  store,
  clientId,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
  store?: SdkStore;
  clientId?: string;
}): SdkStoreHandle<OidcRootState> {
  return injectClient<OidcRootState>(store ?? createSdkStore(), {
    api: oidcApi,
    reducerPath: oidcApi.reducerPath,
    requestMiddleware,
    logger,
    clientId,
  });
}

/**
 * Reports the clientId already occupying a store's OIDC slot, when it differs
 * from the one being initialised.
 *
 * `oidcApi.reducerPath` is the fixed string 'oidc', so two clients on one store
 * would share a single RTK Query cache slice and silently overwrite each other's
 * token state. Detecting that is cheaper than namespacing per clientId, and
 * failing loudly beats corrupting tokens.
 *
 * @returns The conflicting clientId, or `undefined` when there is no conflict.
 */
export function conflictingClientId(
  store: SdkStore | undefined,
  clientId: string,
): string | undefined {
  const existing = store?.extra.clients[oidcApi.reducerPath];
  if (!existing) {
    return undefined;
  }

  const existingClientId = (existing as { clientId?: string }).clientId;
  return existingClientId && existingClientId !== clientId ? existingClientId : undefined;
}

/**
 * @function createLogoutError
 * @description Creates a logout error object based on the provided data and error.
 * @param  {object | null | undefined} data - The data returned from the logout API call.
 * @param {FetchBaseQueryError | SerializedError} error - An optional error object that may contain details about the error that occurred during the logout process.
 * @returns {null | GenericError} - Returns a `GenericError` object if an error occurred, or `null` if no error is present.
 */
export function createLogoutError(
  data: object | null | undefined,
  error?: FetchBaseQueryError | SerializedError,
): null | GenericError {
  if (error) {
    let message = 'An error occurred while ending the session';
    let status: number | string = 'unknown';
    if ('message' in error && error.message) {
      message = error.message;
    }
    if ('status' in error) {
      status = error.status;
    }
    return {
      error: 'End Session failure',
      message,
      type: 'auth_error',
      status,
    } as const;
  }
  return null;
}

export function createTokenError(type: 'no_tokens' | 'no_access_token' | 'no_id_token') {
  let error: GenericError;

  if (type === 'no_tokens') {
    error = {
      error: 'Token_Error',
      message: 'Required for ending session and revoking access token',
      type: 'state_error',
    } as const;
  } else if (type === 'no_access_token') {
    error = {
      error: 'Token_Error',
      message: 'No access token found in storage; required for revoking access token',
      type: 'state_error',
    } as const;
  } else if (type === 'no_id_token') {
    error = {
      error: 'Token_Error',
      message: 'No ID token found in storage; required for ending session',
      type: 'state_error',
    } as const;
  } else {
    error = {
      error: 'Token_Error',
      message: 'An unknown error occurred while creating the error object',
      type: 'unknown_error',
    } as const;
  }

  return error;
}
