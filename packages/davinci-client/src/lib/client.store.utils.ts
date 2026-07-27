/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { combineSlices, configureStore, createDynamicMiddleware } from '@reduxjs/toolkit';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { GenericError } from '@forgerock/sdk-types';

import type { ErrorNode, ContinueNode, StartNode, SuccessNode } from '../types.js';
import type { InternalErrorResponse } from './client.types.js';

import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { wellknownApi } from '@forgerock/sdk-wellknown';

/**
 * Root reducer built with combineSlices to support lazy injection.
 * External slices (e.g. oidcApi) can be injected via rootReducer.inject().
 */
export const rootReducer = combineSlices(
  configSlice,
  nodeSlice,
  davinciApi,
  wellknownApi,
).withLazyLoadedSlices();

export type RootState = ReturnType<typeof rootReducer>;

export interface RootStateWithNode<
  T extends ErrorNode | ContinueNode | StartNode | SuccessNode,
> extends RootState {
  node: T;
}

/**
 * Internal store shape that carries the root reducer and dynamic middleware
 * so that oidc-client can inject its reducers and middleware at init time.
 *
 * Consumers only ever see the opaque SdkStore type.
 */
export interface InjectableStore {
  readonly store: ReturnType<typeof configureStore<RootState>>;
  readonly rootReducer: typeof rootReducer;
  readonly dynamicMiddleware: ReturnType<typeof createDynamicMiddleware>;
}

export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}): InjectableStore {
  const dynamicMiddleware = createDynamicMiddleware();

  const store = configureStore({
    reducer: rootReducer,
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
        .concat(davinciApi.middleware)
        .concat(wellknownApi.middleware)
        .concat(dynamicMiddleware.middleware),
  });

  return { store, rootReducer, dynamicMiddleware };
}

export type ClientStore = typeof createClientStore;

/** The inner Redux store type — used by effects that need dispatch/getState. */
export type DavinciStore = InjectableStore['store'];

export type AppDispatch = ReturnType<DavinciStore['dispatch']>;

export function handleUpdateValidateError(
  message: string,
  type: 'argument_error' | 'state_error',
  cb: (message: string) => void,
): () => InternalErrorResponse {
  cb(message);
  return function () {
    return {
      error: {
        message: message,
        type: type,
      },
      type: 'internal_error' as const,
    };
  };
}

/**
 * @function createInternalError
 * @description - Creates an InternalErrorResponse object
 * @param message - The error message
 * @param type - The error type
 * @returns - An InternalErrorResponse object
 */
export function createInternalError(
  message: string,
  type: GenericError['type'] = 'internal_error',
): InternalErrorResponse {
  return { error: { message, type }, type: 'internal_error' };
}

/**
 * Type guard: checks if a value is an InternalErrorResponse.
 */
export function isInternalError(value: unknown): value is InternalErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as Record<string, unknown>)['type'] === 'internal_error'
  );
}

/** Cast InjectableStore to the opaque SdkStore for public API exposure. */
export function toSdkStore(injectable: InjectableStore): object {
  return injectable as unknown as object;
}

/** Recover the InjectableStore from an opaque SdkStore handle. */
export function fromSdkStore(sdkStore: object): InjectableStore {
  return sdkStore as unknown as InjectableStore;
}
