/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createSdkStore, injectClient } from '@forgerock/sdk-store';

import { configSlice } from './config.slice.js';
import { journeyApi } from './journey.api.js';

import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { SdkStore, SdkStoreHandle } from '@forgerock/sdk-store';

import type { RootState } from './client.store.utils.js';

/** Creates or attaches the store backing a Journey client. */
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
    slices: [configSlice],
    requestMiddleware,
    logger,
  });
