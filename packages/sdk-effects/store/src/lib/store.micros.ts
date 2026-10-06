/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { INVALID_STORE_MESSAGE, isSdkStoreHandle } from './store.utils.js';

import type { InjectClientOptions, SdkStore, SdkStoreHandle } from './store.types.js';

/** Forces `combineSlices` to recompute state after lazy reducer injection. */
const RECOMPUTE_ACTION = { type: '@@sdk-store/recompute' } as const;

/**
 * Attaches a client to a store: mounts its reducers and middleware, and
 * registers its private slot on the store's client registry.
 *
 * Safe to call more than once for the same client. Client slices must each have
 * a distinct reducer path when sharing a store.
 *
 * @throws If `handle` is not a valid SDK store handle.
 */
export function injectClient<S extends object = Record<string, unknown>>(
  handle: SdkStore,
  options: InjectClientOptions,
): SdkStoreHandle<S> {
  if (!isSdkStoreHandle(handle)) {
    throw new Error(INVALID_STORE_MESSAGE);
  }

  const { api, slices = [], requestMiddleware, logger, clientId } = options;
  const { reducerPath } = api;
  const inject = handle.rootReducer.inject as (slice: unknown) => unknown;
  inject(api);
  for (const slice of slices) inject(slice);

  const addMiddleware = handle.dynamicMiddleware.addMiddleware as (middleware: unknown) => unknown;
  const clients = handle.extra.clients as Record<string, unknown>;
  if (!(reducerPath in clients)) addMiddleware(api.middleware);

  clients[reducerPath] = { requestMiddleware, logger, clientId };
  handle.store.dispatch(RECOMPUTE_ACTION as never);

  // TypeScript cannot compute state assembled by successive lazy injections.
  return handle as unknown as SdkStoreHandle<S>;
}
