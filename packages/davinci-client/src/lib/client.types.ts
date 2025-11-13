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
} from './collector.types.js';
import type { ErrorNode, FailureNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

export type FlowNode = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;

export interface InternalErrorResponse {
  error: Omit<GenericError, 'error'> & { message: string };
  type: 'internal_error';
}

export type InitFlow = () => Promise<FlowNode | InternalErrorResponse>;

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
  : T extends { type: 'TextCollector'; category: 'SingleValueCollector' }
    ? string
    : T extends { type: 'TextCollector'; category: 'ValidatedSingleValueCollector' }
      ? string
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
                          :
                              | string
                              | string[]
                              | PhoneNumberInputValue
                              | FidoRegistrationInputValue
                              | FidoAuthenticationInputValue;

/**
 * Generic updater function that accepts values appropriate for the collector type.
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
export type Validator = (value: string) =>
  | string[]
  | {
      error: {
        message: string;
        type: string;
      };
      type: string;
    };

export type NodeStates = StartNode | ContinueNode | ErrorNode | SuccessNode | FailureNode;
