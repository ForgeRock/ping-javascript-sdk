/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

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
