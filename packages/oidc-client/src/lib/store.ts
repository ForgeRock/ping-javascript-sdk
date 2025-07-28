import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';

import { configureStore } from '@reduxjs/toolkit';
import { wellknownApi } from './wellknown.api.js';
import { authorizeSlice } from './authorize.slice.js';

export function createOidcStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}) {
  return configureStore({
    reducer: {
      [wellknownApi.reducerPath]: wellknownApi.reducer,
      [authorizeSlice.reducerPath]: authorizeSlice.reducer,
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
        .concat(authorizeSlice.middleware),
  });
}
