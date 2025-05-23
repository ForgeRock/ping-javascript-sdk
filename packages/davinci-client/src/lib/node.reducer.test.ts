/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect } from 'vitest';

import { nodeCollectorReducer } from './node.reducer.js';
import {
  DeviceAuthenticationCollector,
  DeviceRegistrationCollector,
  MultiSelectCollector,
  PhoneNumberCollector,
  SubmitCollector,
  TextCollector,
} from './collector.types.js';

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
          value: {
            username: 'This is the default data',
          },
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

describe('The node collector reducer with DeviceAuthenticationFieldValue', () => {
  it('should handle collector updates ', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'device-0',
        value: '42036625-37a5-4c7a-b7c4-ef778838c8e1',
      },
    };
    const state: DeviceAuthenticationCollector[] = [
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'DeviceAuthenticationCollector',
        id: 'device-0',
        name: 'device',
        input: {
          key: 'device',
          value: {
            type: '',
            id: '',
            value: '',
          },
          type: 'TEXT',
        },
        output: {
          key: 'device',
          label: 'First Name',
          type: 'TEXT',
          options: [
            {
              type: 'SMS',
              label: 'Text Message',
              value: '55122b45-b192-4a6e-ad54-e2fd8f1a0a47',
              default: true,
              content: '***-***-6036',
              key: '55122b45-b192-4a6e-ad54-e2fd8f1a0a47',
            },
            {
              type: 'EMAIL',
              label: 'Email',
              value: '42036625-37a5-4c7a-b7c4-ef778838c8e1',
              default: false,
              content: 's***********1@pingidentity.com',
              key: '42036625-37a5-4c7a-b7c4-ef778838c8e1',
            },
            {
              type: 'VOICE',
              label: 'Voice',
              value: 'e958e8c4-505a-4db1-9726-45bf38bed4da',
              default: false,
              content: '***-***-6036',
              key: 'e958e8c4-505a-4db1-9726-45bf38bed4da',
            },
          ],
        },
      },
    ];
    expect(nodeCollectorReducer(state, action)).toStrictEqual([
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'DeviceAuthenticationCollector',
        id: 'device-0',
        name: 'device',
        input: {
          key: 'device',
          value: {
            type: 'EMAIL',
            id: '42036625-37a5-4c7a-b7c4-ef778838c8e1',
            value: 's***********1@pingidentity.com',
          },
          type: 'TEXT',
        },
        output: {
          key: 'device',
          label: 'First Name',
          type: 'TEXT',
          options: [
            {
              type: 'SMS',
              label: 'Text Message',
              value: '55122b45-b192-4a6e-ad54-e2fd8f1a0a47',
              default: true,
              content: '***-***-6036',
              key: '55122b45-b192-4a6e-ad54-e2fd8f1a0a47',
            },
            {
              type: 'EMAIL',
              label: 'Email',
              value: '42036625-37a5-4c7a-b7c4-ef778838c8e1',
              default: false,
              content: 's***********1@pingidentity.com',
              key: '42036625-37a5-4c7a-b7c4-ef778838c8e1',
            },
            {
              type: 'VOICE',
              label: 'Voice',
              value: 'e958e8c4-505a-4db1-9726-45bf38bed4da',
              default: false,
              content: '***-***-6036',
              key: 'e958e8c4-505a-4db1-9726-45bf38bed4da',
            },
          ],
        },
      },
    ]);
  });
});

describe('The node collector reducer with DeviceRegistrationFieldValue', () => {
  it('should handle collector updates ', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'device-0',
        value: 'EMAIL',
      },
    };
    const state: DeviceRegistrationCollector[] = [
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'DeviceRegistrationCollector',
        id: 'device-0',
        name: 'device',
        input: {
          key: 'device',
          value: 'EMAIL',
          type: 'TEXT',
        },
        output: {
          key: 'device',
          label: 'First Name',
          type: 'TEXT',
          options: [
            {
              type: 'EMAIL',
              label: 'Email',
              content: 'Receive an authentication passcode in your email.',
              value: 'EMAIL',
              key: 'VOICE-0',
            },
            {
              type: 'SMS',
              label: 'Text Message',
              content: 'Receive an authentication passcode in a text message.',
              value: 'SMS',
              key: 'SMS-1',
            },
            {
              type: 'VOICE',
              label: 'Voice',
              content: 'Receive a phone call with an authentication passcode.',
              value: 'VOICE',
              key: 'VOICE-2',
            },
          ],
        },
      },
    ];
    expect(nodeCollectorReducer(state, action)).toStrictEqual([
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'DeviceRegistrationCollector',
        id: 'device-0',
        name: 'device',
        input: {
          key: 'device',
          value: 'EMAIL',
          type: 'TEXT',
        },
        output: {
          key: 'device',
          label: 'First Name',
          type: 'TEXT',
          options: [
            {
              type: 'EMAIL',
              label: 'Email',
              content: 'Receive an authentication passcode in your email.',
              value: 'EMAIL',
              key: 'VOICE-0',
            },
            {
              type: 'SMS',
              label: 'Text Message',
              content: 'Receive an authentication passcode in a text message.',
              value: 'SMS',
              key: 'SMS-1',
            },
            {
              type: 'VOICE',
              label: 'Voice',
              content: 'Receive a phone call with an authentication passcode.',
              value: 'VOICE',
              key: 'VOICE-2',
            },
          ],
        },
      },
    ]);
  });
});

describe('The phone number collector reducer', () => {
  it('should populate phone number collector', () => {
    const action = {
      type: 'node/next',
      payload: {
        fields: [
          {
            key: 'phone-number-key',
            defaultCountryCode: null,
            label: 'Phone Number',
            type: 'PHONE_NUMBER',
            required: true,
          },
        ],
      },
    };
    expect(nodeCollectorReducer(undefined, action)).toEqual([
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'PhoneNumberCollector',
        id: 'phone-number-key-0',
        name: 'phone-number-key',
        input: {
          key: 'phone-number-key',
          value: {
            countryCode: '',
            phoneNumber: '',
          },
          type: 'PHONE_NUMBER',
        },
        output: {
          key: 'phone-number-key',
          label: 'Phone Number',
          type: 'PHONE_NUMBER',
          value: {
            countryCode: '',
            phoneNumber: '',
          },
        },
      },
    ]);
  });

  it('should populate phone number collector with default value', () => {
    const action = {
      type: 'node/next',
      payload: {
        fields: [
          {
            key: 'phone-number-key',
            defaultCountryCode: 'US',
            label: 'Phone Number',
            type: 'PHONE_NUMBER',
            required: true,
          },
        ],
      },
    };
    expect(nodeCollectorReducer(undefined, action)).toEqual([
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'PhoneNumberCollector',
        id: 'phone-number-key-0',
        name: 'phone-number-key',
        input: {
          key: 'phone-number-key',
          value: {
            countryCode: 'US',
            phoneNumber: '',
          },
          type: 'PHONE_NUMBER',
        },
        output: {
          key: 'phone-number-key',
          label: 'Phone Number',
          type: 'PHONE_NUMBER',
          value: {
            countryCode: 'US',
            phoneNumber: '',
          },
        },
      },
    ]);
  });

  it('should handle collector updates ', () => {
    const action = {
      type: 'node/update',
      payload: {
        id: 'phone-number-key-0',
        value: {
          countryCode: 'US',
          phoneNumber: '555-555-5555',
        },
      },
    };
    const state: PhoneNumberCollector[] = [
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'PhoneNumberCollector',
        id: 'phone-number-key-0',
        name: 'phone-number-key',
        input: {
          key: 'phone-number-key',
          value: {
            countryCode: '',
            phoneNumber: '',
          },
          type: 'PHONE_NUMBER',
        },
        output: {
          key: 'phone-number-key',
          label: 'Phone Number',
          type: 'PHONE_NUMBER',
          value: {
            countryCode: '',
          },
        },
      },
    ];
    expect(nodeCollectorReducer(state, action)).toStrictEqual([
      {
        category: 'ObjectValueCollector',
        error: null,
        type: 'PhoneNumberCollector',
        id: 'phone-number-key-0',
        name: 'phone-number-key',
        input: {
          key: 'phone-number-key',
          value: {
            countryCode: 'US',
            phoneNumber: '555-555-5555',
          },
          type: 'PHONE_NUMBER',
        },
        output: {
          key: 'phone-number-key',
          label: 'Phone Number',
          type: 'PHONE_NUMBER',
          value: {
            countryCode: '',
          },
        },
      },
    ]);
  });
});
