/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Per-client slots carried on a store's thunk `extraArgument`.
 *
 * A Redux store has exactly one `extraArgument`, but a shared SDK store serves
 * several clients. Keying the contents by the owning api's `reducerPath` gives
 * each client a private slot, so one client's request middleware and logger can
 * never be resolved by another client's endpoints.
 *
 * The slot type is left generic because each client's needs differ — journey
 * only uses request middleware, oidc and davinci use both middleware and a
 * logger. Callers narrow it at the point of use.
 */
export interface SdkStoreExtra<Slot = unknown> {
  readonly clients: Record<string, Slot>;
}

/**
 * Resolves the calling client's own slot from a store's `extraArgument`.
 *
 * This runs on every request, so it never throws. An unrecognised or malformed
 * `extra` yields an empty slot rather than an error — and, critically, never
 * falls back to a store-wide value that would belong to a different client.
 *
 * @param extra - The thunk `extraArgument`, as received from `api.extra`
 * @param reducerPath - The calling api's `reducerPath`, used as the slot key
 * @returns The client's own slot, or an empty object if none is registered
 */
export function clientExtra<Slot extends object>(extra: unknown, reducerPath: string): Slot {
  if (typeof extra !== 'object' || extra === null || !('clients' in extra)) {
    return {} as Slot;
  }

  const { clients } = extra as { clients: unknown };
  if (typeof clients !== 'object' || clients === null) {
    return {} as Slot;
  }

  const slot = (clients as Record<string, unknown>)[reducerPath];
  if (typeof slot !== 'object' || slot === null) {
    return {} as Slot;
  }

  return slot as Slot;
}

/**
 * Builds an `extraArgument` registry holding a single client's slot.
 *
 * Used by each client factory when it creates its own store. When a store is
 * shared, additional slots are added at injection time.
 */
export function createStoreExtra<Slot extends object>(
  reducerPath: string,
  slot: Slot,
): SdkStoreExtra<Slot> {
  return { clients: { [reducerPath]: slot } };
}
