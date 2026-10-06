/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import {
  getClientForReducerPath,
  INVALID_STORE_MESSAGE,
  isSdkStoreHandle,
  wellknownApi,
} from '@forgerock/sdk-store';
import { combineSlices } from '@reduxjs/toolkit';

import { oidcApi } from './oidc.api.js';

import type { ActionTypes } from '@forgerock/sdk-request-middleware';
import type { SdkStore } from '@forgerock/sdk-store';
import type { GenericError } from '@forgerock/sdk-types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { ParsedOidcArgs, RawOidcArgs } from './client.store.types.js';

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
  if (!store) return undefined;
  const existing = getClientForReducerPath(store, oidcApi.reducerPath);
  if (!existing) return undefined;
  return existing.clientId && existing.clientId !== clientId ? existing.clientId : undefined;
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

/**
 * @function parseOidcArgs
 * @description Pure, synchronous parser for OIDC factory arguments that implements
 *              the "parse, don't validate" pattern. Returns a narrowed
 *              {@link ParsedOidcArgs} on success, or a {@link GenericError} describing
 *              the first structural failure found.
 *
 *              The PAR check (which requires a network round-trip) is intentionally
 *              excluded — it belongs in `oidc()` after the wellknown fetch.
 * @param raw - The unvalidated arguments to parse.
 * @returns {ParsedOidcArgs<ActionType> | GenericError}
 */
export function parseOidcArgs<ActionType extends ActionTypes = ActionTypes>(
  raw: RawOidcArgs<ActionType>,
): ParsedOidcArgs<ActionType> | GenericError {
  /**
   * Validate before touching the store. RTK's `inject` is irreversible, so
   * mutating a caller-owned store and *then* rejecting the arguments would leave
   * them permanently carrying a slice from a call that never succeeded.
   */
  if (raw.store !== undefined && !isSdkStoreHandle(raw.store)) {
    return {
      error: INVALID_STORE_MESSAGE,
      type: 'argument_error',
    };
  }
  if (!raw.config?.serverConfig?.wellknown) {
    return {
      error: 'Requires a wellknown url initializing this factory.',
      type: 'argument_error',
    };
  }
  if (!raw.config?.clientId) {
    return {
      error: 'Requires a clientId.',
      type: 'argument_error',
    };
  }

  /**
   * `oidcApi.reducerPath` is a fixed string, so a second client on the same
   * store would share one cache slice and clobber the first client's tokens.
   * Re-initialising the same clientId is fine and stays idempotent.
   */
  const validatedStore = raw.store as SdkStore | undefined;
  const conflict = conflictingClientId(validatedStore, raw.config.clientId);
  if (conflict) {
    return {
      error:
        `This store is already in use by an OIDC client with clientId '${conflict}'. ` +
        'Use a separate store per clientId.',
      type: 'argument_error',
    };
  }

  return raw as unknown as ParsedOidcArgs<ActionType>;
}
