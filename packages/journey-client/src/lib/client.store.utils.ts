/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { logger as loggerFn } from '@forgerock/sdk-logger';
import { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { combineSlices, configureStore, createDynamicMiddleware } from '@reduxjs/toolkit';

import { configSlice } from './config.slice.js';
import { journeyApi } from './journey.api.js';
import { wellknownApi } from '@forgerock/sdk-wellknown';

/**
 * Root reducer built with combineSlices to support lazy injection.
 * External slices (e.g. oidcApi) can be injected via rootReducer.inject().
 */
export const rootReducer = combineSlices(
  journeyApi,
  configSlice,
  wellknownApi,
).withLazyLoadedSlices();

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Internal store shape carrying root reducer and dynamic middleware
 * so that oidc-client can inject its reducers and middleware at init time.
 */
export interface InjectableStore {
  readonly store: ReturnType<typeof configureStore<RootState>>;
  readonly rootReducer: typeof rootReducer;
  readonly dynamicMiddleware: ReturnType<typeof createDynamicMiddleware>;
}

/** The inner Redux store type — used by effects that need dispatch/getState. */
export type JourneyStore = InjectableStore['store'];

export const createJourneyStore = <ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}): InjectableStore => {
  const dynamicMiddleware = createDynamicMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: true,
        thunk: {
          extraArgument: {
            requestMiddleware,
            logger,
          },
        },
      })
        .concat(journeyApi.middleware)
        .concat(wellknownApi.middleware)
        .concat(dynamicMiddleware.middleware),
  });

  return { store, rootReducer, dynamicMiddleware };
};

/** Cast InjectableStore to the opaque SdkStore for public API exposure. */
export function toSdkStore(injectable: InjectableStore): object {
  return injectable as unknown as object;
}

/** Recover the InjectableStore from an opaque SdkStore handle. */
export function fromSdkStore(sdkStore: object): InjectableStore {
  return sdkStore as unknown as InjectableStore;
}
