/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { GenericError } from '@forgerock/sdk-types';

import type { ErrorNode, ContinueNode, StartNode, SuccessNode } from '../types.js';
import type { InternalErrorResponse } from './client.types.js';

import { combineSlices } from '@reduxjs/toolkit';

import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { createSdkStore, injectClient, wellknownApi } from '@forgerock/sdk-store';
import type { SdkStore, SdkStoreHandle } from '@forgerock/sdk-store';

/**
 * The canonical description of the state this client contributes.
 *
 * The runtime store is assembled by `injectClient`, which TypeScript cannot
 * follow across lazy injection. Combining the same slices here lets the state
 * type be *derived* from them rather than hand-written, so it cannot drift from
 * what is actually mounted. Exported so the derived state type resolves for
 * consumers, and so an application can compose the reducer itself if it wants.
 */
export const rootReducer = combineSlices(configSlice, nodeSlice, davinciApi, wellknownApi);

export type RootState = ReturnType<typeof rootReducer>;

export interface RootStateWithNode<
  T extends ErrorNode | ContinueNode | StartNode | SuccessNode,
> extends RootState {
  node: T;
}

/**
 * Creates, or attaches to, the store backing a DaVinci client.
 *
 * Passing `store` attaches to an existing SDK store so that discovery caching
 * and state are shared; omitting it creates one, which is the default.
 */
export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
  store,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
  store?: SdkStore;
}): SdkStoreHandle<RootState> {
  return injectClient<RootState>(store ?? createSdkStore(), {
    api: davinciApi,
    reducerPath: davinciApi.reducerPath,
    slices: [configSlice, nodeSlice],
    requestMiddleware,
    logger,
  });
}

export type ClientStore = typeof createClientStore;

/** The inner Redux store type — used by effects that need dispatch/getState. */
export type DavinciStore = SdkStoreHandle<RootState>['store'];

export type AppDispatch = DavinciStore['dispatch'];

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
