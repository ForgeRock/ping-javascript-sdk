/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createSdkStore, getClientForReducerPath, injectClient } from '@forgerock/sdk-store';

import { oidcApi } from './oidc.api.js';

import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { SdkStore, SdkStoreHandle } from '@forgerock/sdk-store';

import type { OidcRootState } from './client.store.utils.js';

/**
 * Creates or attaches the private store backing an OIDC client after the
 * public factory has validated its arguments and shared-store ownership.
 */
export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
  store,
  clientId,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
  store?: SdkStore;
  clientId?: string;
}): SdkStoreHandle<OidcRootState> {
  const conflict = store && getClientForReducerPath(store, oidcApi.reducerPath)?.clientId;
  if (conflict && conflict !== clientId) {
    throw new Error(
      `This store is already in use by an OIDC client with clientId '${conflict}'. ` +
        'Use a separate store per clientId.',
    );
  }

  return injectClient<OidcRootState>(store ?? createSdkStore(), {
    api: oidcApi,
    requestMiddleware,
    logger,
    clientId,
  });
}
