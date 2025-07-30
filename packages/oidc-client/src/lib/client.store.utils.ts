/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';

import { configureStore } from '@reduxjs/toolkit';
import { oidcApi } from './oidc.api.js';
import { wellknownApi } from './wellknown.api.js';
import { GenericError } from './error.types.js';

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

export function createError(
  type: 'no_tokens' | 'no_access_token' | 'no_id_token',
  log: ReturnType<typeof loggerFn>,
) {
  let error: GenericError;

  if (type === 'no_tokens') {
    error = {
      error: 'No tokens found in storage',
      message: 'Required for ending session and revoking access token',
      type: 'state_error',
    } as const;
  } else if (type === 'no_access_token') {
    error = {
      error: 'No access token found',
      message: 'No access token found in storage; required for revoking access token',
      type: 'state_error',
    } as const;
  } else if (type === 'no_id_token') {
    error = {
      error: 'No ID token found',
      message: 'No ID token found in storage; required for ending session',
      type: 'state_error',
    } as const;
  } else {
    error = {
      error: 'Unknown error type',
      message: 'An unknown error occurred while creating the error object',
      type: 'unknown_error',
    } as const;
  }

  log.error(error.error);

  return error;
}

type ClientStore = typeof createClientStore;

export type RootState = ReturnType<ReturnType<ClientStore>['getState']>;

export type AppDispatch = ReturnType<ReturnType<ClientStore>['dispatch']>;
