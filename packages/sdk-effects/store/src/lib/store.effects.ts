/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { combineSlices, configureStore, createDynamicMiddleware } from '@reduxjs/toolkit';

import { wellknownApi } from './wellknown.api.js';

import type {
  InjectClientOptions,
  SdkStore,
  SdkStoreHandle,
  SdkStoreRegistry,
} from './store.types.js';

/**
 * Dispatched after a slice injection to force `combineSlices` to recompute.
 *
 * `inject()` registers the reducer but does not itself recalculate state, so
 * without this a caller reading `getState()` straight after injection would not
 * see its own slice. Doing it here means no client has to know that.
 */
const RECOMPUTE_ACTION = { type: '@@sdk-store/recompute' } as const;

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
 * Human-readable explanation used whenever an argument fails the
 * {@link isSdkStoreHandle} check.
 *
 * Exported so client packages can reference the same string rather than
 * duplicating it.
 */
export const INVALID_STORE_MESSAGE =
  'The provided `store` is not a valid SDK store. Pass the `store` returned by ' +
  'another SDK client, or one created with `createSdkStore()`.';

/**
 * Narrows an unknown value to a usable store handle.
 *
 * Client factories accept a store from application code, so the value cannot be
 * trusted. Checking it here turns a bad argument into a clear error instead of a
 * `TypeError` raised somewhere inside RTK.
 */
export function isSdkStoreHandle(value: unknown): value is SdkStore {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<SdkStoreHandle>;

  return (
    typeof candidate.store === 'object' &&
    candidate.store !== null &&
    typeof candidate.store.dispatch === 'function' &&
    typeof candidate.store.getState === 'function' &&
    typeof candidate.rootReducer === 'function' &&
    typeof candidate.rootReducer.inject === 'function' &&
    typeof candidate.dynamicMiddleware === 'object' &&
    candidate.dynamicMiddleware !== null &&
    typeof candidate.dynamicMiddleware.addMiddleware === 'function' &&
    typeof candidate.extra === 'object' &&
    candidate.extra !== null &&
    typeof candidate.extra.clients === 'object'
  );
}

/**
 * Validates that `store` is either `undefined` or a valid {@link SdkStore}.
 * Returns `undefined` on success, or a `GenericError` describing the failure.
 *
 * Using this in factory functions avoids duplicating the
 * `isSdkStoreHandle` guard + `INVALID_STORE_MESSAGE` string in every package.
 */
export function assertValidStore(
  store: unknown,
): { error: string; type: 'argument_error' } | undefined {
  if (store !== undefined && !isSdkStoreHandle(store)) {
    return { error: INVALID_STORE_MESSAGE, type: 'argument_error' };
  }
  return undefined;
}

/**
 * Returns the registered client slot for a given reducer path, or `undefined`.
 * Use this instead of reaching into `store.extra.clients` directly.
 */
export function getClientForReducerPath(
  store: SdkStore,
  reducerPath: string,
): { clientId?: string } | undefined {
  return store.extra.clients[reducerPath] as { clientId?: string } | undefined;
}

/**
 * Attaches a client to a store: mounts its reducers and middleware, and
 * registers its private slot on the store's client registry.
 *
 * Safe to call more than once for the same client — RTK deduplicates reducer
 * injection, and re-registering a slot simply overwrites it with equal values.
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

  const { api, reducerPath, slices = [], requestMiddleware, logger, clientId } = options;

  const inject = handle.rootReducer.inject as (slice: unknown) => unknown;
  inject(api);
  for (const slice of slices) {
    inject(slice);
  }

  const addMiddleware = handle.dynamicMiddleware.addMiddleware as (mw: unknown) => unknown;
  const alreadyInjected = reducerPath in (handle.extra.clients as Record<string, unknown>);
  if (!alreadyInjected) {
    addMiddleware(api.middleware);
  }

  // The registry is readonly to consumers but mutable here by design: this is
  // the only place a slot is created, and it must work on a store built earlier.
  (handle.extra.clients as Record<string, unknown>)[reducerPath] = {
    requestMiddleware,
    logger,
    clientId,
  };

  handle.store.dispatch(RECOMPUTE_ACTION as never);

  /**
   * The only widening in the shared-store path, and it is unavoidable:
   * TypeScript cannot compute a state shape that is assembled by successive
   * lazy `inject()` calls. The caller states the shape its own slices produce,
   * and it is correct by construction because those slices were just injected
   * above. Keeping it here means no client package needs a cast of its own.
   */
  return handle as unknown as SdkStoreHandle<S>;
}
