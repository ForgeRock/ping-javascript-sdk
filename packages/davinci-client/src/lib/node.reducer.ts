/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the required utilities from Redux Toolkit
 */
import { createAction, createReducer } from '@reduxjs/toolkit';
import { Result } from 'effect';

/**
 * Import the collector utilities
 */
import {
  returnActionCollector,
  returnFlowCollector,
  returnMetadataCollector,
  returnPasswordCollector,
  returnValidatedPasswordCollector,
  returnIdpCollector,
  returnSubmitCollector,
  returnTextCollector,
  returnBooleanCollector,
  returnValidatedBooleanCollector,
  returnSingleSelectCollector,
  returnMultiSelectCollector,
  returnReadOnlyCollector,
  returnObjectSelectCollector,
  returnObjectValueCollector,
  returnProtectCollector,
  returnPollingCollector,
  returnUnknownCollector,
  returnFidoRegistrationCollector,
  returnFidoAuthenticationCollector,
  returnQrCodeCollector,
  returnImageCollector,
} from './collector.utils.js';
import { resolveCollectorUpdateValue } from './collector.validation.js';
import type { DaVinciField, UnknownField } from './davinci.types.js';
import type { PhoneNumberOutputValue, PhoneNumberExtensionOutputValue } from './collector.types.js';
import type {
  CollectorValueType,
  CollectorValueTypes,
  UpdatableCollectors,
} from './client.types.js';
import type { Collectors } from './node.types.js';

/**
 * Validates `value` against `collector` and, if valid, invokes `cb` with
 * the narrowed value. No-ops on validation failure, discarding the
 * error: the reducer only needs to know whether to no-op, not why.
 */
function updateCollector<T extends UpdatableCollectors>(
  collector: T,
  value: CollectorValueTypes,
  cb: (resolvedValue: CollectorValueType<T>) => void,
): void {
  const result = resolveCollectorUpdateValue(collector, value);
  if (Result.isSuccess(result)) {
    const resolvedValue = result.success;
    cb(resolvedValue);
  }
}

/**
 * @const nextCollectorValues - Action for setting the next collector values
 * @see https://redux-toolkit.js.org/api/createAction
 *
 * This is for internal "collector" setup for handling the state of the current node
 */
export const nextCollectorValues = createAction<{
  fields: DaVinciField[];
  formData: { value: Record<string, unknown> };
}>('node/next');
export const updateCollectorValues = createAction<{
  id: string;
  value: CollectorValueTypes;
  index?: number;
}>('node/update');
export const pollCollectorValues = createAction('node/poll');

/**
 * @const initialCollectorValues - Initial state for the collector values
 */
const initialCollectorValues: Collectors[] = [];

/**
 * @const nodeCollectorReducer - Reducer for handling the collector values
 * @see https://redux-toolkit.js.org/api/createReducer
 */
export const nodeCollectorReducer = createReducer(initialCollectorValues, (builder) => {
  builder
    /**
     * Using the `nextCollectorValues` const (e.g. `'node/next'`) to add the case
     * 'node/next' is essentially derived `createSlice` below. `node.next()` is
     * transformed to `'node/next'` for the action type.
     */
    .addCase(nextCollectorValues, (_, action) => {
      const fields = action.payload.fields;
      // Map the fields to the initial state with the schema of Generic Collector
      const collectors = Array.isArray(fields)
        ? fields.map((field: DaVinciField, idx: number) => {
            /**
             * Some collectors may not have the same properties as others;
             * LABEL field types are one of them, so let's catch them first.
             */
            if (field.type === 'LABEL' || field.type === 'AGREEMENT') {
              return returnReadOnlyCollector(field, idx);
            }

            if (field.type === 'QR_CODE') {
              return returnQrCodeCollector(field, idx);
            }

            if (field.type === 'IMAGE') {
              return returnImageCollector(field, idx);
            }

            // *Some* collectors may have default or existing data to display
            const data =
              action.payload.formData &&
              action.payload.formData.value &&
              action.payload.formData.value[field.key];

            // Match specific collectors
            switch (field.type) {
              case 'CHECKBOX':
              case 'COMBOBOX': {
                // Intentional fall-through
                const strArr = data as string[];
                return returnMultiSelectCollector(field, idx, strArr);
              }
              case 'DROPDOWN':
              case 'RADIO': {
                // Intentional fall-through
                const str = data as string;
                return returnSingleSelectCollector(field, idx, str);
              }
              case 'FLOW_BUTTON':
              case 'FLOW_LINK': {
                // Intentional fall-through
                // No data to send
                return returnFlowCollector(field, idx);
              }
              case 'DEVICE_AUTHENTICATION':
              case 'DEVICE_REGISTRATION': {
                // Intentional fall-through
                return returnObjectSelectCollector(field, idx);
              }
              case 'PASSWORD_VERIFY':
              case 'PASSWORD': {
                return field.passwordPolicy
                  ? returnValidatedPasswordCollector(field, idx)
                  : returnPasswordCollector(field, idx);
              }
              case 'PHONE_NUMBER': {
                const prefillData = data as
                  | PhoneNumberOutputValue
                  | PhoneNumberExtensionOutputValue;
                return returnObjectValueCollector(field, idx, prefillData);
              }
              case 'SINGLE_CHECKBOX': {
                return field.required === true
                  ? returnValidatedBooleanCollector(field, idx)
                  : returnBooleanCollector(field, idx);
              }
              case 'TEXT': {
                const str = data as string;
                return returnTextCollector(field, idx, str);
              }
              case 'SOCIAL_LOGIN_BUTTON': {
                // No data to send
                return returnIdpCollector(field, idx);
              }
              case 'SUBMIT_BUTTON': {
                // No data to send
                return returnSubmitCollector(field, idx);
              }
              case 'PROTECT': {
                return returnProtectCollector(field, idx);
              }
              case 'POLLING': {
                // No data to send
                return returnPollingCollector(field, idx);
              }
              case 'FIDO2': {
                if (field.action === 'REGISTER') {
                  return returnFidoRegistrationCollector(field, idx);
                } else if (field.action === 'AUTHENTICATE') {
                  return returnFidoAuthenticationCollector(field, idx);
                }
                break;
              }
              case 'METADATA': {
                return returnMetadataCollector(field, idx);
              }
              default:
              // Default is handled below
            }

            // Generic Collectors
            if (field.type.includes('BUTTON') || field.type.includes('LINK')) {
              // No data to send
              return returnActionCollector(field, idx, 'ActionCollector');
            }

            return returnUnknownCollector(field as UnknownField, idx);
          })
        : [];
      return collectors || [];
    })
    /**
     * Using the `updateCollectorValues` const (e.g. `'node/update'`) to add the case
     * 'node/update' is essentially derived `createSlice` below. `node.update()` is
     * transformed to `'node/update'` for the action type.
     */
    .addCase(updateCollectorValues, (state, action) => {
      const collector = state.find((collector) => collector.id === action.payload.id);

      // Every branch below is a no-op rather than a throw: `update()` in
      // client.store.ts already validates the id exists and the category is
      // updatable before dispatching, so reaching an unmatched case here means
      // the action was dispatched directly, bypassing that gate.
      if (!collector) {
        return;
      }

      // These categories structurally include `SingleValueCollectorNoValue<'SingleValueCollector'>`,
      // a shape no runtime factory in collector.utils.ts ever produces; cast to the
      // narrower `UpdatableCollectors` that `updateCollector` actually expects.
      // Only this category-discriminated branch needs the cast — the type-discriminated
      // branches below narrow `collector` to a concrete type, so `updateCollector`
      // infers a precise return type and no cast is needed.
      if (
        collector.category === 'SingleValueCollector' ||
        collector.category === 'ValidatedSingleValueCollector' ||
        collector.category === 'SingleValueAutoCollector'
      ) {
        updateCollector(collector as UpdatableCollectors, action.payload.value, (resolvedValue) => {
          collector.input.value = resolvedValue as string | number | boolean;
        });
        return;
      }

      if (collector.category === 'MultiValueCollector') {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          if (Array.isArray(resolvedValue)) {
            collector.input.value = [...resolvedValue];
          } else {
            collector.input.value.push(resolvedValue);
          }
        });
        return;
      }

      if (collector.type === 'DeviceAuthenticationCollector') {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          // Iterate through the options object and find option to update
          const option = collector.output.options.find((option) => option.value === resolvedValue);
          if (!option) {
            return;
          }
          // Remap values back to DaVinci spec
          collector.input.value = {
            type: option.type,
            id: option.value,
            value: option.content,
          };
        });
        return;
      }

      if (collector.type === 'DeviceRegistrationCollector') {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          // Iterate through the options object and find option to update
          const option = collector.output.options.find((option) => option.value === resolvedValue);
          if (!option) {
            return;
          }
          collector.input.value = option.type;
        });
        return;
      }

      if (
        collector.type === 'PhoneNumberCollector' ||
        collector.type === 'PhoneNumberExtensionCollector'
      ) {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          collector.input.value = resolvedValue;
        });
        return;
      }

      if (collector.type === 'FidoRegistrationCollector') {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          collector.input.value = resolvedValue;
        });
        return;
      }

      if (collector.type === 'FidoAuthenticationCollector') {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          collector.input.value = resolvedValue;
        });
        return;
      }

      if (collector.type === 'MetadataCollector') {
        updateCollector(collector, action.payload.value, (resolvedValue) => {
          collector.input.value = resolvedValue;
        });
        return;
      }
    })
    /**
     * Using the `pollCollectorValues` const (e.g. `'node/poll'`) to add the case
     * 'node/poll' is essentially derived `createSlice` below. `node.poll()` is
     * transformed to `'node/poll'` for the action type.
     */
    .addCase(pollCollectorValues, (state) => {
      // For continue polling, track and decrement retries when this reducer is called
      const pollCollector = state.find((collector) => collector.type === 'PollingCollector');

      if (!pollCollector) {
        return;
      }

      if (pollCollector.output.config.retriesRemaining === undefined) {
        pollCollector.error = 'Polling collector does not track retriesRemaining';
        return;
      }

      if (pollCollector.output.config.retriesRemaining <= 0) {
        pollCollector.error = 'No poll retries left';
        return;
      }

      pollCollector.error = null;
      pollCollector.output.config.retriesRemaining--;
    });
});
