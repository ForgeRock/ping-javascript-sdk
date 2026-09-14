/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { logger as loggerFn } from '@forgerock/sdk-logger';
import { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';

import { combineSlices } from '@reduxjs/toolkit';

import { configSlice } from './config.slice.js';
import { journeyApi } from './journey.api.js';
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
export const rootReducer = combineSlices(journeyApi, configSlice, wellknownApi);

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Creates, or attaches to, the store backing a Journey client.
 *
 * Passing `store` attaches to an existing SDK store so that discovery caching
 * and state are shared; omitting it creates one, which is the default.
 */
export const createJourneyStore = <ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
  store,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
  store?: SdkStore;
}): SdkStoreHandle<RootState> =>
  injectClient<RootState>(store ?? createSdkStore(), {
    api: journeyApi,
    reducerPath: journeyApi.reducerPath,
    slices: [configSlice],
    requestMiddleware,
    logger,
  });
