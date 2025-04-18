/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the required utilities from Redux Toolkit
 */
import { createAction, createReducer } from '@reduxjs/toolkit';

/**
 * Import the collector utilities
 */
import {
  returnActionCollector,
  returnFlowCollector,
  returnPasswordCollector,
  returnSingleValueCollector,
  returnIdpCollector,
  returnSubmitCollector,
  returnTextCollector,
  returnSingleSelectCollector,
  returnMultiSelectCollector,
  returnReadOnlyCollector,
} from './collector.utils.js';
import type { DaVinciField } from './davinci.types.js';
import {
  ActionCollector,
  MultiSelectCollector,
  SingleSelectCollector,
  FlowCollector,
  PasswordCollector,
  SingleValueCollector,
  IdpCollector,
  SubmitCollector,
  TextCollector,
  ReadOnlyCollector,
  ValidatedTextCollector,
} from './collector.types.js';

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
  value: string | string[];
  index?: number;
}>('node/update');

/**
 * @const initialCollectorValues - Initial state for the collector values
 */
const initialCollectorValues: (
  | FlowCollector
  | PasswordCollector
  | TextCollector
  | IdpCollector
  | SubmitCollector
  | ActionCollector<'ActionCollector'>
  | SingleValueCollector<'SingleValueCollector'>
  | SingleSelectCollector
  | MultiSelectCollector
  | ReadOnlyCollector
  | ValidatedTextCollector
)[] = [];

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
            if (field.type === 'LABEL') {
              return returnReadOnlyCollector(field, idx);
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
              case 'PASSWORD':
              case 'PASSWORD_VERIFY': {
                // No data to send
                return returnPasswordCollector(field, idx);
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
              default:
              // Default is handled below
            }

            // Generic Collectors
            if (field.type.includes('BUTTON') || field.type.includes('LINK')) {
              // No data to send
              return returnActionCollector(field, idx, 'ActionCollector');
            }

            const str = data as string;
            return returnSingleValueCollector(field, idx, 'SingleValueCollector', str);
          })
        : [];
      return collectors || [];
    })
    /**
     * Using the `updateCollectorValues` const (e.g. `'node/update'`) to add the case
     * 'node/next' is essentially derived `createSlice` below. `node.next()` is
     * transformed to `'node/next'` for the action type.
     */
    .addCase(updateCollectorValues, (state, action) => {
      const collector = state.find((collector) => collector.id === action.payload.id);
      if (!collector) {
        throw new Error('No collector found to update');
      }
      if (collector.category === 'ActionCollector') {
        throw new Error('ActionCollectors are read-only');
      }
      if (collector.category === 'NoValueCollector') {
        throw new Error('NoValueCollectors, like ReadOnlyCollectors, are read-only');
      }
      if (action.payload.value === undefined) {
        throw new Error('Value argument cannot be undefined');
      }

      if (
        collector.category === 'SingleValueCollector' ||
        collector.category === 'ValidatedSingleValueCollector'
      ) {
        if (Array.isArray(action.payload.value)) {
          throw new Error('SingleValueCollector does not accept an array');
        }
        collector.input.value = action.payload.value;
        return;
      }

      if (collector.category === 'MultiValueCollector') {
        if (Array.isArray(action.payload.value)) {
          collector.input.value = [...action.payload.value];
        } else {
          collector.input.value.push(action.payload.value);
        }
        return;
      }
    });
});
