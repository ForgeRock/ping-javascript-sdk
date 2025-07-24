/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';

import { configureStore } from '@reduxjs/toolkit';
import { wellknownApi } from './wellknown.api.js';

export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}) {
  return configureStore({
    reducer: {
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
      }).concat(wellknownApi.middleware),
  });
}

type ClientStore = typeof createClientStore;

export type RootState = ReturnType<ReturnType<ClientStore>['getState']>;

export type AppDispatch = ReturnType<ReturnType<ClientStore>['dispatch']>;
