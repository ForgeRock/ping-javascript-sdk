/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect } from 'vitest';

import { nodeCollectorReducer } from './node.reducer.js';
import { MultiSelectCollector, SubmitCollector, TextCollector } from './collector.types.js';

describe('The node collector reducer', () => {
  it('should return the initial state', () => {
    const action = { type: 'node/next', payload: [] };
    expect(nodeCollectorReducer(undefined, action)).toEqual([]);
  });

  it('should handle next node with one field', () => {
    const action = {
      type: 'node/next',
      payload: {
        fields: [
          {
            key: 'username',
            type: 'TEXT',
            label: 'Username',
          },
        ],
        formData: {},
      },
    };
    expect(nodeCollectorReducer(undefined, action)).toEqual([
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'Username',
          type: 'TEXT',
          value: '',
        },
      },
    ]);
  });
  it('should NOT populate the formData with input information for password collector', () => {
    const action = {
      type: 'node/next',
      payload: {
        fields: [
          {
            key: 'username',
            type: 'TEXT',
            label: 'Username',
          },
          {
            key: 'password',
            type: 'PASSWORD',
            label: 'Password',
          },
          {
            key: 'submit',
            type: 'SUBMIT_BUTTON',
            label: 'Submit',
          },
        ],
        formData: {
          password: 'SUPERSECRETPASSWORD',
        },
      },
    };
    expect(nodeCollectorReducer(undefined, action)).toEqual([
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'Username',
          type: 'TEXT',
          value: '',
        },
      },
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'PasswordCollector',
        id: 'password-1',
        name: 'password',
        input: {
          key: 'password',
          value: '',
          type: 'PASSWORD',
        },
        output: {
          key: 'password',
          label: 'Password',
          type: 'PASSWORD',
        },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'submit-2',
        name: 'submit',
        output: {
          key: 'submit',
          label: 'Submit',
          type: 'SUBMIT_BUTTON',
        },
      },
    ]);
  });
  it('should populate the formData with input information', () => {
    const action = {
      type: 'node/next',
      payload: {
        fields: [
          {
            key: 'username',
            type: 'TEXT',
            label: 'Username',
          },
          {
            key: 'password',
            type: 'PASSWORD',
            label: 'Password',
          },
          {
            key: 'submit',
            type: 'SUBMIT_BUTTON',
            label: 'Submit',
          },
        ],
        formData: {
          username: 'This is the default data',
        },
      },
    };
    expect(nodeCollectorReducer(undefined, action)).toEqual([
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'Username',
          type: 'TEXT',
          value: 'This is the default data',
        },
      },
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'PasswordCollector',
        id: 'password-1',
        name: 'password',
        input: {
          key: 'password',
          value: '',
          type: 'PASSWORD',
        },
        output: {
          key: 'password',
          label: 'Password',
          type: 'PASSWORD',
        },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'submit-2',
        name: 'submit',
        output: {
          key: 'submit',
          label: 'Submit',
          type: 'SUBMIT_BUTTON',
        },
      },
    ]);
  });
  it('should handle next node with multiple fields', () => {
    const action = {
      type: 'node/next',
      payload: {
        fields: [
          {
            key: 'username',
            type: 'TEXT',
            label: 'Username',
          },
          {
            key: 'password',
            type: 'PASSWORD',
            label: 'Password',
          },
          {
            key: 'submit',
            type: 'SUBMIT_BUTTON',
            label: 'Submit',
          },
        ],
        formData: {},
      },
    };
    expect(nodeCollectorReducer(undefined, action)).toEqual([
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'Username',
          type: 'TEXT',
          value: '',
        },
      },
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'PasswordCollector',
        id: 'password-1',
        name: 'password',
        input: {
          key: 'password',
          value: '',
          type: 'PASSWORD',
        },
        output: {
          key: 'password',
          label: 'Password',
          type: 'PASSWORD',
        },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'submit-2',
        name: 'submit',
        output: {
          key: 'submit',
          label: 'Submit',
          type: 'SUBMIT_BUTTON',
        },
      },
    ]);
  });

  it('should handle collector updates ', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'username-0',
        value: 'JaneSmith',
      },
    };
    const state: TextCollector[] = [
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'First Name',
          type: 'TEXT',
          value: '',
        },
      },
    ];
    expect(nodeCollectorReducer(state, action)).toEqual([
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: 'JaneSmith',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'First Name',
          type: 'TEXT',
          value: '',
        },
      },
    ]);
  });

  it('should throw with no collectors', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'submit-1',
        value: 'JaneSmith',
      },
    };
    const state: TextCollector[] = [
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'wrongcollector-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'First Name',
          type: 'TEXT',
          value: '',
        },
      },
    ];
    expect(() => nodeCollectorReducer(state, action)).toThrowError('No collector found to update');
  });

  it('should throw with no Action Collector', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'submit-1',
        value: 'JaneSmith',
      },
    };
    const state: (TextCollector | SubmitCollector)[] = [
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'wrongcollector-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'TEXT',
        },
        output: {
          key: 'username',
          label: 'First Name',
          type: 'TEXT',
          value: '',
        },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'submit-1',
        name: 'submit',
        output: {
          key: 'submit',
          label: 'Submit',
          type: 'SUBMIT_BUTTON',
        },
      },
    ];
    expect(() => nodeCollectorReducer(state, action)).toThrowError(
      'ActionCollectors are read-only',
    );
  });
});

describe('The node collector reducer with MultiValueCollector', () => {
  it('should handle collector updates ', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'color-0',
        value: 'red',
      },
    };
    const state: MultiSelectCollector[] = [
      {
        category: 'MultiValueCollector',
        error: null,
        type: 'MultiSelectCollector',
        id: 'color-0',
        name: 'color',
        input: {
          key: 'color',
          value: [],
          type: 'TEXT',
        },
        output: {
          key: 'color',
          label: 'First Name',
          type: 'TEXT',
          options: [
            {
              label: 'Red',
              value: 'red',
            },
            {
              label: 'Blue',
              value: 'blue',
            },
            {
              label: 'Green',
              value: 'green',
            },
          ],
          value: [],
        },
      },
    ];
    expect(nodeCollectorReducer(state, action)).toStrictEqual([
      {
        category: 'MultiValueCollector',
        error: null,
        type: 'MultiSelectCollector',
        id: 'color-0',
        name: 'color',
        input: {
          key: 'color',
          value: ['red'],
          type: 'TEXT',
        },
        output: {
          key: 'color',
          label: 'First Name',
          type: 'TEXT',
          options: [
            {
              label: 'Red',
              value: 'red',
            },
            {
              label: 'Blue',
              value: 'blue',
            },
            {
              label: 'Green',
              value: 'green',
            },
          ],
          value: [],
        },
      },
    ]);
  });
});
