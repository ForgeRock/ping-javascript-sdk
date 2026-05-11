/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { GenericError } from '@forgerock/sdk-types';

import type {
  FidoRegistrationInputValue,
  FidoAuthenticationInputValue,
  PhoneNumberInputValue,
  PhoneNumberExtensionInputValue,
} from './collector.types.js';
import type { ErrorNode, FailureNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

export type FlowNode = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;

export interface InternalErrorResponse {
  error: Omit<GenericError, 'error'> & { message: string };
  type: 'internal_error';
}

export type InitFlow = () => Promise<FlowNode | InternalErrorResponse>;

export type CollectorInputTypes =
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
export type CollectorValueType<T> = T extends { type: 'PasswordCollector' }
  ? string
  : T extends { type: 'ValidatedPasswordCollector' }
    ? string
    : T extends { type: 'TextCollector'; category: 'SingleValueCollector' }
      ? string
      : T extends { type: 'TextCollector'; category: 'ValidatedSingleValueCollector' }
        ? string
        : T extends { type: 'ValidatedBooleanCollector' }
          ? boolean
          : T extends { type: 'SingleSelectCollector' }
            ? string
            : T extends { type: 'MultiSelectCollector' }
              ? string[]
              : T extends { type: 'DeviceRegistrationCollector' }
                ? string
                : T extends { type: 'DeviceAuthenticationCollector' }
                  ? string
                  : T extends { type: 'PhoneNumberCollector' }
                    ? PhoneNumberInputValue
                    : T extends { type: 'PhoneNumberExtensionCollector' }
                      ? PhoneNumberExtensionInputValue
                      : T extends { type: 'FidoRegistrationCollector' }
                        ? FidoRegistrationInputValue
                        : T extends { type: 'FidoAuthenticationCollector' }
                          ? FidoAuthenticationInputValue
                          : T extends { category: 'SingleValueCollector' }
                            ? string
                            : T extends { category: 'ValidatedSingleValueCollector' }
                              ? string
                              : T extends { category: 'MultiValueCollector' }
                                ? string[]
                                : CollectorInputTypes;

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
 * Validates a collector's current value and returns any validation errors.
 *
 * @param value - The current value of the collector to validate.
 * @returns An array of error message strings, or an error object. Returns an empty array when validation passes.
 */
export type Validator = (value: CollectorInputTypes) =>
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
