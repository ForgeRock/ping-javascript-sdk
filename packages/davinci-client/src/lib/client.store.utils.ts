/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { configureStore } from '@reduxjs/toolkit';
import { Match, Either } from 'effect';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { GenericError } from '@forgerock/sdk-types';

import type {
  ErrorNode,
  ContinueNode,
  StartNode,
  SuccessNode,
  Collectors,
  CollectorCategory,
} from './node.types.js';
import type {
  CollectorValueType,
  CollectorValueTypes,
  InternalErrorResponse,
  UpdatableCollectors,
} from './client.types.js';

import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { wellknownApi } from './wellknown.api.js';

export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
  logger,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
  logger?: ReturnType<typeof loggerFn>;
}) {
  return configureStore({
    reducer: {
      config: configSlice.reducer,
      node: nodeSlice.reducer,
      [davinciApi.reducerPath]: davinciApi.reducer,
      [wellknownApi.reducerPath]: wellknownApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            /**
             * This becomes the `api.extra` argument, and will be passed into the
             * customer query wrapper for `baseQuery`
             */
            requestMiddleware,
            logger,
          },
        },
      })
        .concat(davinciApi.middleware)
        .concat(wellknownApi.middleware),
  });
}

export type ClientStore = typeof createClientStore;

export type RootState = ReturnType<ReturnType<ClientStore>['getState']>;

export interface RootStateWithNode<
  T extends ErrorNode | ContinueNode | StartNode | SuccessNode,
> extends RootState {
  node: T;
}

export type AppDispatch = ReturnType<ReturnType<ClientStore>['dispatch']>;

/**
 * @function createInternalError
 * @description - Creates an InternalErrorResponse object
 * @param message - The error message
 * @param type - The error type
 * @returns - An InternalErrorResponse object
 */
export function createInternalError(
  message: string,
  type: GenericError['type'] = 'internal_error',
): InternalErrorResponse {
  return { error: { message, type }, type: 'internal_error' };
}

/**
 * Type guard: checks if a value is an InternalErrorResponse.
 */
export function isInternalError(value: unknown): value is InternalErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as Record<string, unknown>)['type'] === 'internal_error'
  );
}

/**
 * Logs a collector update or validation failure and returns a
 * function producing the corresponding `InternalErrorResponse`.
 *
 * @param message - The error message to log and embed in the response
 * @param type - Whether the failure stems from a bad argument or invalid state
 * @param cb - Logging callback invoked with `message` (e.g. `log.error`)
 * @returns A function that, when called, returns the `InternalErrorResponse`
 */
export function handleUpdateValidateError(
  message: string,
  type: 'argument_error' | 'state_error',
  cb: (message: string) => void,
): () => InternalErrorResponse {
  cb(message);
  return function () {
    return {
      error: {
        message: message,
        type: type,
      },
      type: 'internal_error' as const,
    };
  };
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
 * @returns `Either.right` with the narrowed value, or `Either.left` with the validation error
 */
export function resolveCollectorUpdateValue<T extends UpdatableCollectors>(
  collector: T,
  value: CollectorValueTypes,
): Either.Either<CollectorValueType<T>, InternalErrorResponse> {
  const ok = (v: CollectorValueTypes) => Either.right(v as CollectorValueType<T>);
  const err = (message: string) => Either.left(createInternalError(message, 'argument_error'));

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
