/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { logger as loggerFn } from '@forgerock/sdk-logger';

import { configureStore, type SerializedError } from '@reduxjs/toolkit';
import { oidcApi } from './oidc.api.js';
import { wellknownApi } from './wellknown.api.js';

import type { GenericError } from '@forgerock/sdk-types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * @function createClientStore
 * @description Creates a Redux store configured with OIDC and well-known APIs.
 * @param param - Configuration options for the client store.
 * @param {RequestMiddleware} param.requestMiddleware - An array of request middleware functions to be applied to the store.
 * @param {ReturnType<typeof loggerFn>} param.logger - An optional logger function for logging messages.
 * @returns { ReturnType<typeof configureStore> } - Returns a configured Redux store with OIDC and well-known APIs.
 */
export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}) {
  return configureStore({
    reducer: {
      [oidcApi.reducerPath]: oidcApi.reducer,
      [wellknownApi.reducerPath]: wellknownApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            /**
             * This becomes the `api.extra` argument, and will be passed into the
             * customer query wrapper for `baseQuery`
             */
            requestMiddleware,
            logger,
          },
        },
      })
        .concat(wellknownApi.middleware)
        .concat(oidcApi.middleware),
  });
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
