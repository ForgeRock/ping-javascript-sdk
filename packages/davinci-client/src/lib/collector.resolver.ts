/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Pure resolver functions for collector value validation.
 *
 * Extracted from client.store.utils.ts into its own module to break the
 * circular import chain:
 *
 *   node.slice.ts → node.reducer.ts → client.store.utils.ts → nodeSlice (node.slice.ts)
 *
 * By living here, node.reducer.ts can import these functions without touching
 * client.store.utils.ts (which imports nodeSlice). client.store.utils.ts
 * re-exports from this file to preserve its public API.
 */
import { Match, Result } from 'effect';

import type { CollectorCategory, Collectors } from './node.types.js';
import type {
  CollectorValueType,
  CollectorValueTypes,
  InternalErrorResponse,
  UpdatableCollectors,
} from './client.types.js';

import type { GenericError } from '@forgerock/sdk-types';

/** Locally-inlined copy of createInternalError to avoid importing from client.store.utils.ts,
 *  which imports nodeSlice (node.slice.ts) and would recreate the circular dependency.
 */
function createInternalError(
  message: string,
  type: GenericError['type'] = 'internal_error',
): InternalErrorResponse {
  return { error: { message, type }, type: 'internal_error' };
}

/**
 * Type guard: checks whether a collector's `category` is one of the given
 * `validCategories`, narrowing it to the matching union member on success.
 *
 * @param collector - The collector to check
 * @param validCategories - The set of categories considered valid
 * @returns `true` if `collector.category` is included in `validCategories`
 */
export function isValidCollectorCategory<C extends CollectorCategory>(
  collector: Collectors,
  validCategories: C[],
): collector is Extract<Collectors, { category: C }> {
  return validCategories.some((validCategory) => collector.category === validCategory);
}

/**
 * Validates a value against the shape a given collector accepts, returning the
 * value narrowed to `CollectorValueType<T>` on success.
 *
 * This is the single source of truth for the collector→value-type correlation:
 * both `update()` (pre-dispatch, to fail fast) and the `node/update` reducer
 * (post-dispatch, to type the assignment) call this same function so the
 * mapping can't drift between the two call sites.
 *
 * @param collector - The collector the value is being validated against
 * @param value - The candidate value to validate
 * @returns `Result.succeed` with the narrowed value, or `Result.fail` with the validation error
 */
export function resolveCollectorUpdateValue<T extends UpdatableCollectors>(
  collector: T,
  value: CollectorValueTypes,
): Result.Result<CollectorValueType<T>, InternalErrorResponse> {
  const ok = (v: CollectorValueTypes) => Result.succeed(v as CollectorValueType<T>);
  const err = (message: string) => Result.fail(createInternalError(message, 'argument_error'));

  if (value === undefined) {
    return err('Value argument cannot be undefined');
  }

  return Match.value<UpdatableCollectors>(collector).pipe(
    Match.when({ type: 'BooleanCollector' }, () =>
      typeof value === 'boolean' ? ok(value) : err('Value argument must be a boolean'),
    ),
    Match.when({ type: 'ValidatedBooleanCollector' }, () =>
      typeof value === 'boolean' ? ok(value) : err('Value argument must be a boolean'),
    ),
    Match.when({ type: 'DeviceAuthenticationCollector' }, (c) => {
      if (typeof value !== 'string') return err('Value argument must be a string');
      const option = c.output.options.find((option) => option.value === value);
      return option ? ok(value) : err('No option found matching value to update');
    }),
    Match.when({ type: 'DeviceRegistrationCollector' }, (c) => {
      if (typeof value !== 'string') return err('Value argument must be a string');
      const option = c.output.options.find((option) => option.value === value);
      return option ? ok(value) : err('No option found matching value to update');
    }),
    Match.when({ type: 'PhoneNumberCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      if (!('phoneNumber' in value) || !('countryCode' in value)) {
        return err('Value argument must contain a phoneNumber and countryCode property');
      }
      return ok(value);
    }),
    Match.when({ type: 'PhoneNumberExtensionCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      if (!('phoneNumber' in value) || !('countryCode' in value) || !('extension' in value)) {
        return err(
          'Value argument must contain a phoneNumber, countryCode, and extension property',
        );
      }
      return ok(value);
    }),
    Match.when({ type: 'FidoRegistrationCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      const isFidoError = 'type' in value && value.type === 'fido_error';
      if (!isFidoError && !('attestationValue' in value)) {
        return err('Value argument must contain an attestationValue property');
      }
      return ok(value);
    }),
    Match.when({ type: 'FidoAuthenticationCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      const isFidoError = 'type' in value && value.type === 'fido_error';
      if (!isFidoError && !('assertionValue' in value)) {
        return err('Value argument must contain an assertionValue property');
      }
      return ok(value);
    }),
    Match.when({ type: 'MetadataCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      return ok(value);
    }),
    Match.when({ category: 'SingleValueCollector' }, () =>
      typeof value === 'string' ? ok(value) : err('Value argument must be a string'),
    ),
    Match.when({ category: 'ValidatedSingleValueCollector' }, () =>
      typeof value === 'string' ? ok(value) : err('Value argument must be a string'),
    ),
    Match.when({ category: 'SingleValueAutoCollector' }, () =>
      typeof value === 'string' ? ok(value) : err('Value argument must be a string'),
    ),
    Match.when({ category: 'MultiValueCollector' }, () =>
      typeof value === 'string' || Array.isArray(value)
        ? ok(value)
        : err('MultiValueCollector does not accept an object'),
    ),
    Match.when({ category: 'ObjectValueCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      return ok(value);
    }),
    Match.when({ category: 'ObjectValueAutoCollector' }, () => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return err('Value argument must be an object');
      }
      return ok(value);
    }),
    Match.exhaustive,
  );
}
