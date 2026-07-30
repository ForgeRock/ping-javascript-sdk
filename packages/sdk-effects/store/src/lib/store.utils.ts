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
