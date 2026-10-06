/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { combineSlices, configureStore, createDynamicMiddleware } from '@reduxjs/toolkit';

import { wellknownApi } from './wellknown.api.js';

import type { SdkStore, SdkStoreRegistry } from './store.types.js';

/**
 * Creates a Redux store that SDK clients can share.
 *
 * Only the well-known discovery slice is mounted up front — that is the one
 * piece every client needs, and mounting it once is what makes the discovery
 * document fetch exactly once per URL no matter how many clients attach.
 * Everything else arrives through {@link injectClient}.
 *
 * Applications may call this directly to own the store themselves, but they do
 * not have to: each client factory creates one on demand when none is passed.
 */
export function createSdkStore(): SdkStore {
  const dynamicMiddleware = createDynamicMiddleware();
  const rootReducer = combineSlices(wellknownApi).withLazyLoadedSlices();

  // Captured by reference so slots registered later are visible to every request.
  const extra: SdkStoreRegistry = { clients: {} };

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: extra } })
        .concat(wellknownApi.middleware)
        .concat(dynamicMiddleware.middleware),
  });

  return {
    store,
    rootReducer,
    dynamicMiddleware,
    extra,
  } as unknown as SdkStore;
}

/**
 * Removes a client slot from the registry when initialization fails.
 *
 * Injection is irreversible at the RTK level, but clearing the registry slot
 * lets a different client retry with a different clientId. Without this, a
 * failed wellknown fetch would permanently "own" the store for the first
 * clientId, preventing any other client from attaching.
 *
 * @param store - The store to clean up.
 * @param reducerPath - The client's reducer path (e.g., 'oidc').
 */
export function unregisterClient(store: SdkStore, reducerPath: string): void {
  // The registry is mutable by design — this is the cleanup counterpart to injectClient.
  delete (store.extra.clients as Record<string, unknown>)[reducerPath];
}
