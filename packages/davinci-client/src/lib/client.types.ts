/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { GenericError } from '@forgerock/sdk-types';

import type {
  AutoCollectors,
  FidoAuthenticationInputValue,
  FidoRegistrationInputValue,
  MultiValueCollectors,
  ObjectValueCollectors,
  PhoneNumberExtensionInputValue,
  PhoneNumberInputValue,
  ValidatedBooleanCollector,
  ValidatedPasswordCollector,
  ValidatedTextCollector,
} from './collector.types.js';
import type { ContinueNode, ErrorNode, FailureNode, StartNode, SuccessNode } from './node.types.js';

export type FlowNode = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;

export interface InternalErrorResponse {
  error: Omit<GenericError, 'error'> & { message: string };
  type: 'internal_error';
}

export type InitFlow = () => Promise<FlowNode | InternalErrorResponse>;

/**
 * Allowed value types accepted by collector updaters
 */
export type CollectorValueTypes =
  | string
  | string[]
  | boolean
  | PhoneNumberInputValue
  | PhoneNumberExtensionInputValue
  | FidoRegistrationInputValue
  | FidoAuthenticationInputValue;

/**
 * Maps collector types to the specific value type they accept.
 * This enables type narrowing when using the update method with specific collector types.
 *
 * @example
 * ```typescript
 * if (collector.type === "PasswordCollector") {
 *   const updater = davinciClient.update(collector);
 *   // updater now only accepts: (value: string, index?: number) => ...
 * }
 * ```
 */
export type CollectorValueType<T> =
  // string input types
  T extends
    | { type: 'PasswordCollector' }
    | { type: 'ValidatedPasswordCollector' }
    | { type: 'SingleSelectCollector' }
    | { type: 'DeviceRegistrationCollector' }
    | { type: 'DeviceAuthenticationCollector' }
    | { type: 'ProtectCollector' }
    | { type: 'PollingCollector' }
    ? string
    : // TextCollector branches must remain compound — category is the only discriminant
      T extends { type: 'TextCollector'; category: 'SingleValueCollector' }
      ? string
      : T extends { type: 'TextCollector'; category: 'ValidatedSingleValueCollector' }
        ? string
        : // boolean input types
          T extends { type: 'BooleanCollector' } | { type: 'ValidatedBooleanCollector' }
          ? boolean
          : // string[] input types
            T extends { type: 'MultiSelectCollector' }
            ? string[]
            : // specialized input types
              T extends { type: 'PhoneNumberCollector' }
              ? PhoneNumberInputValue
              : T extends { type: 'PhoneNumberExtensionCollector' }
                ? PhoneNumberExtensionInputValue
                : T extends { type: 'FidoRegistrationCollector' }
                  ? FidoRegistrationInputValue
                  : T extends { type: 'FidoAuthenticationCollector' }
                    ? FidoAuthenticationInputValue
                    : // category catch-alls
                      // fallbacks for collectors that don't match on `type`
                      T extends { category: 'SingleValueCollector' }
                      ? string
                      : T extends { category: 'ValidatedSingleValueCollector' }
                        ? string
                        : T extends { category: 'SingleValueAutoCollector' }
                          ? string
                          : T extends { category: 'MultiValueCollector' }
                            ? string[]
                            : T extends { category: 'ActionCollector' }
                              ? never
                              : T extends { category: 'NoValueCollector' }
                                ? never
                                : CollectorValueTypes;

/**
 * A function type that updates a collector's value. Accepts values appropriate for the collector type.
 * When used with type narrowing, the value parameter will be constrained to the correct type.
 *
 * @template T The collector type (inferred from the collector passed to update())
 * @param value The value to update the collector with (type depends on T)
 * @param index Optional index for multi-value collectors
 * @returns null on success, or an InternalErrorResponse on failure
 */
export type Updater<T = unknown> = (
  value: CollectorValueType<T>,
  index?: number,
) => InternalErrorResponse | null;

/**
 * Collectors which can be validated
 */
export type ValidatedCollectors =
  | ValidatedTextCollector
  | ValidatedBooleanCollector
  | ValidatedPasswordCollector
  | ObjectValueCollectors
  | MultiValueCollectors
  | AutoCollectors;

/**
 * Validates a collector's current value and returns any validation errors.
 *
 * @param value - The current value of the collector to validate.
 * @returns An array of error message strings, or an error object. Returns an empty array when validation passes.
 */
export type Validator<T extends ValidatedCollectors = ValidatedCollectors> = (
  value: CollectorValueType<T>,
) =>
  | string[]
  | {
      error: {
        message: string;
        type: string;
      };
      type: string;
    };

/**
 * A function type that polls for the current status during challenge or continue polling.
 *
 * @returns A promise resolving to a `PollingStatus` string indicating the current state,
 *   or an `InternalErrorResponse` if the poll request fails.
 */
export type Poller = () => Promise<PollingStatus | InternalErrorResponse>;

export type NodeStates = StartNode | ContinueNode | ErrorNode | SuccessNode | FailureNode;

/**
 * Polling status type for handling custom statuses. Resolves to any string.
 */
export type CustomPollingStatus = string & {};
export type PollingStatusChallengeComplete =
  | 'approved'
  | 'denied'
  | 'continue'
  | CustomPollingStatus;
export type PollingStatusChallenge =
  | PollingStatusChallengeComplete
  | 'expired'
  | 'timedOut'
  | 'error';
export type PollingStatusContinue = 'continue' | 'timedOut';
export type PollingStatus = PollingStatusContinue | PollingStatusChallenge;
