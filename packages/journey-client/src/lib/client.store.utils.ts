/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { logger as loggerFn } from '@forgerock/sdk-logger';
import { RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { journeyApi } from './journey.api.js';
import { journeySlice } from './journey.slice.js';
import { wellknownApi } from './wellknown.api.js';
import { InternalJourneyClientConfig } from './config.types.js';

const rootReducer = combineReducers({
  [journeyApi.reducerPath]: journeyApi.reducer,
  [journeySlice.name]: journeySlice.reducer,
  [wellknownApi.reducerPath]: wellknownApi.reducer,
});

export const createJourneyStore = ({
  requestMiddleware,
  logger,
  config,
}: {
  requestMiddleware?: RequestMiddleware[];
  logger?: ReturnType<typeof loggerFn>;
  config: InternalJourneyClientConfig;
}) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: true,
        thunk: {
          extraArgument: {
            requestMiddleware,
            logger,
            config,
          },
        },
      })
        .concat(journeyApi.middleware)
        .concat(wellknownApi.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
