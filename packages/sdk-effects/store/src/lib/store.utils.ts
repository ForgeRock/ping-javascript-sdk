/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { ClientSlot, SdkStore, SdkStoreHandle } from './store.types.js';

/** Human-readable explanation used whenever an argument fails validation. */
export const INVALID_STORE_MESSAGE =
  'The provided `store` is not a valid SDK store. Pass the `store` returned by ' +
  'another SDK client, or one created with `createSdkStore()`.';

/** Narrows an unknown value to a usable SDK store handle. */
export function isSdkStoreHandle(value: unknown): value is SdkStore {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<SdkStoreHandle>;
  return (
    typeof candidate.store === 'object' &&
    candidate.store !== null &&
    typeof candidate.store.dispatch === 'function' &&
    typeof candidate.store.getState === 'function' &&
    typeof candidate.store.subscribe === 'function' &&
    typeof candidate.rootReducer === 'function' &&
    typeof candidate.rootReducer.inject === 'function' &&
    typeof candidate.dynamicMiddleware === 'object' &&
    candidate.dynamicMiddleware !== null &&
    typeof candidate.dynamicMiddleware.addMiddleware === 'function' &&
    typeof candidate.extra === 'object' &&
    candidate.extra !== null &&
    typeof candidate.extra.clients === 'object' &&
    candidate.extra.clients !== null
  );
}

/** Returns an argument error if `store` is supplied but is not an SDK handle. */
export function assertValidStore(
  store: unknown,
): { error: string; type: 'argument_error' } | undefined {
  return store !== undefined && !isSdkStoreHandle(store)
    ? { error: INVALID_STORE_MESSAGE, type: 'argument_error' }
    : undefined;
}

/** Returns the registered slot for `reducerPath`, if one exists. */
export function getClientForReducerPath(
  store: SdkStore,
  reducerPath: string,
): ClientSlot | undefined {
  return store.extra.clients[reducerPath];
}

/**
 * Resolves the calling client's own slot from a store's `extraArgument`.
 *
 * This runs on every request, so it never throws. An unrecognised or malformed
 * `extra` yields the provided `defaults` (or an empty object) rather than an
 * error — and, critically, never falls back to a store-wide value that would
 * belong to a different client.
 *
 * When `defaults` are supplied, any slot key that is absent or `undefined` is
 * filled in from `defaults`, letting callers express their fallback values once
 * at the call site instead of with repeated `?? x` expressions.
 *
 * @param extra - The thunk `extraArgument`, as received from `api.extra`
 * @param reducerPath - The calling api's `reducerPath`, used as the slot key
 * @param defaults - Optional fallback values for missing or undefined slot fields
 * @returns The client's own slot merged with defaults, or just defaults / {} if no slot is registered
 */
export function clientExtra<Slot extends object>(
  extra: unknown,
  reducerPath: string,
  defaults?: Partial<Slot>,
): Slot {
  const fallback = (defaults ?? {}) as Slot;

  if (typeof extra !== 'object' || extra === null || !('clients' in extra)) {
    return fallback;
  }

  const { clients } = extra as { clients: unknown };
  if (typeof clients !== 'object' || clients === null) {
    return fallback;
  }

  const slot = (clients as Record<string, unknown>)[reducerPath];
  if (typeof slot !== 'object' || slot === null) {
    return fallback;
  }

  if (defaults === undefined) {
    return slot as Slot;
  }

  // Merge: defaults fill in any key that is absent or undefined in the slot.
  const merged = { ...slot } as Record<string, unknown>;
  for (const [key, value] of Object.entries(defaults as Record<string, unknown>)) {
    if (merged[key] === undefined) {
      merged[key] = value;
    }
  }
  return merged as Slot;
}
