/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect } from 'vitest';
import {
  returnActionCollector,
  returnFlowCollector,
  returnIdpCollector,
  returnSubmitCollector,
  returnSingleValueCollector,
  returnPasswordCollector,
  returnTextCollector,
  returnSingleSelectCollector,
  returnMultiSelectCollector,
  returnValidator,
  returnReadOnlyCollector,
  returnNoValueCollector,
  returnObjectSelectCollector,
  returnObjectValueCollector,
} from './collector.utils.js';
import type {
  DaVinciField,
  DeviceAuthenticationField,
  DeviceRegistrationField,
  PhoneNumberField,
  ReadOnlyField,
  RedirectField,
  StandardField,
} from './davinci.types.js';
import { ValidatedTextCollector } from './collector.types.js';

describe('Action Collectors', () => {
  describe('returnFlowCollector', () => {
    const mockField: DaVinciField = {
      key: 'flow-key',
      label: 'Flow Label',
      type: 'BUTTON',
    };

    it('should create a valid flow collector', () => {
      const result = returnFlowCollector(mockField, 1);
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'FlowCollector',
        id: 'flow-key-1',
        name: 'flow-key',
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
        },
      });
    });

    it('should handle error cases properly', () => {
      const invalidField = {} as StandardField;
      const result = returnFlowCollector(invalidField, 1);
      expect(result.error).toContain('Label is not found');
      expect(result.error).toContain('Type is not found');
    });
  });

  describe('returnIdpCollector', () => {
    const mockSocialField: RedirectField = {
      key: 'google-login',
      label: 'Continue with Google',
      type: 'SOCIAL_LOGIN_BUTTON',
      links: {
        authenticate: {
          href: 'https://auth.example.com/google',
        },
      },
    };

    it('should create a valid social login collector with authentication URL', () => {
      const result = returnIdpCollector(mockSocialField, 1);
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'IdpCollector',
        id: 'google-login-1',
        name: 'google-login',
        output: {
          key: 'google-login-1',
          label: mockSocialField.label,
          type: mockSocialField.type,
          url: 'https://auth.example.com/google',
        },
      });
    });

    it('should handle missing authentication URL', () => {
      const fieldWithoutUrl: DaVinciField = {
        key: 'google-login',
        label: 'Continue with Google',
        type: 'BUTTON',
      };
      // this type could be more comprehensive
      // that is why casting as any here works
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = returnIdpCollector(fieldWithoutUrl, 1);
      if ('url' in result.output) {
        expect(result.output.url).toBeNull();
      }
    });

    it('should handle error cases properly', () => {
      const invalidField = {} as StandardField;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = returnIdpCollector(invalidField, 1);
      expect(result.type).toBe('IdpCollector');
    });
  });

  describe('returnSubmitCollector', () => {
    const mockField: DaVinciField = {
      key: 'submit-key',
      label: 'Submit Form',
      type: 'SUBMIT_BUTTON',
    };

    it('should create a valid submit collector', () => {
      const result = returnSubmitCollector(mockField, 1);
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'submit-key-1',
        name: 'submit-key',
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
        },
      });
    });

    it('should handle error cases properly', () => {
      const invalidField = {} as StandardField;
      const result = returnSubmitCollector(invalidField, 1);
      expect(result.error).toContain('Key is not found');
      expect(result.type).toBe('SubmitCollector');
    });
  });

  describe('returnActionCollector', () => {
    const mockField: StandardField = {
      key: 'testKey',
      label: 'Test Label',
      type: 'TEXT',
    };

    const socialLoginField: DaVinciField = {
      key: 'google-login',
      label: 'Login with Google',
      type: 'SOCIAL_LOGIN_BUTTON',
      links: {
        authenticate: {
          href: 'https://auth.example.com/google',
        },
      },
    };

    it('should return a valid ActionCollector with all parameters provided', () => {
      const result = returnActionCollector(mockField, 1, 'ActionCollector');
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'ActionCollector',
        id: 'testKey-1',
        name: 'testKey',
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
        },
      });
    });

    it('should return a valid SubmitCollector', () => {
      const result = returnActionCollector(mockField, 1, 'SubmitCollector');
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'testKey-1',
        name: 'testKey',
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
        },
      });
    });

    it('should return a valid FlowCollector', () => {
      const result = returnActionCollector(mockField, 1, 'FlowCollector');
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'FlowCollector',
        id: 'testKey-1',
        name: 'testKey',
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
        },
      });
    });

    it('creates a social login collector with URL', () => {
      const result = returnActionCollector(socialLoginField, 1, 'IdpCollector');
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'IdpCollector',
        id: 'google-login-1',
        name: 'google-login',
        output: {
          key: 'google-login-1',
          label: 'Login with Google',
          type: 'SOCIAL_LOGIN_BUTTON',
          url: 'https://auth.example.com/google',
        },
      });
    });

    it('creates an action collector from flow link field type', () => {
      const result = returnFlowCollector(mockField, 1);
      expect(result.type).toBe('FlowCollector');
      expect(result.output).not.toHaveProperty('value');
    });

    it('handles missing authentication URL for social login', () => {
      const result = returnActionCollector(mockField, 1, 'IdpCollector');
      if ('url' in result.output) {
        expect(result.output.url).toBeNull();
      }
    });

    it('should return an error message when field is missing key, label, or type', () => {
      const field = {};
      const idx = 3;
      const result = returnActionCollector(field as StandardField, idx, 'ActionCollector');
      expect(result.error).toBe(
        'Label is not found in the field object. Type is not found in the field object. Key is not found in the field object. ',
      );
    });
  });
});

describe('Single Value Collectors', () => {
  const mockField: DaVinciField = {
    key: 'testKey',
    label: 'Test Label',
    type: 'TEXT',
  };

  describe('returnSingleValueCollector', () => {
    it('should return a valid SingleValueCollector with value in output', () => {
      const result = returnSingleValueCollector(mockField, 1, 'SingleValueCollector');
      expect(result).toEqual({
        category: 'SingleValueCollector',
        error: null,
        type: 'SingleValueCollector',
        id: 'testKey-1',
        name: 'testKey',
        input: {
          key: mockField.key,
          value: '',
          type: mockField.type,
        },
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
          value: '',
        },
      });
    });

    it('should return a valid PasswordCollector without value in output', () => {
      const result = returnSingleValueCollector(mockField, 1, 'PasswordCollector');
      expect(result).toEqual({
        category: 'SingleValueCollector',
        error: null,
        type: 'PasswordCollector',
        id: 'testKey-1',
        name: 'testKey',
        input: {
          key: mockField.key,
          value: '',
          type: mockField.type,
        },
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
        },
      });
      expect(result.output).not.toHaveProperty('value');
    });

    it('should return an error message when field is missing key, label, or type', () => {
      const field = {};
      const idx = 3;
      const result = returnSingleValueCollector(
        field as StandardField,
        idx,
        'SingleValueCollector',
      );
      expect(result.error).toBe(
        'Key is not found in the field object. Label is not found in the field object. Type is not found in the field object. ',
      );
    });
  });

  describe('Specialized Single Value Collectors', () => {
    it('creates a password collector', () => {
      const result = returnPasswordCollector(mockField, 1);
      expect(result.type).toBe('PasswordCollector');
      expect(result.output).not.toHaveProperty('value');
    });

    it('creates a text collector', () => {
      const result = returnTextCollector(mockField, 1, '');
      expect(result.type).toBe('TextCollector');
      expect(result.output).toHaveProperty('value', '');
    });

    it('creates a single select collector from radio field type', () => {
      const field: DaVinciField = {
        type: 'RADIO',
        key: 'radio-field',
        label: 'Radio',
        required: true,
        options: [
          {
            label: 'radio1',
            value: 'radio1',
          },
          {
            label: 'radio2',
            value: 'radio2',
          },
        ],
        inputType: 'SINGLE_SELECT',
      };
      const result = returnSingleSelectCollector(field, 1, '');
      expect(result.type).toBe('SingleSelectCollector');
      expect(result.output).toHaveProperty('value', '');
    });

    it('creates a single select collector from dropdown field type', () => {
      const field: DaVinciField = {
        type: 'DROPDOWN',
        key: 'dropdown-field',
        label: 'Dropdown',
        required: true,
        options: [
          {
            label: 'dropdown1',
            value: 'dropdown1',
          },
          {
            label: 'dropdown2',
            value: 'dropdown2',
          },
          {
            label: 'dropdown3',
            value: 'dropdown3',
          },
        ],
        inputType: 'SINGLE_SELECT',
      };
      const result = returnSingleSelectCollector(field, 1, '');
      expect(result.type).toBe('SingleSelectCollector');
      expect(result.output).toHaveProperty('value', '');
    });
  });
});

describe('Multi-Value Collectors', () => {
  describe('Specialized Multi-Select Collectors', () => {
    it('creates a multi-select collector from combobox field type', () => {
      const comboField: DaVinciField = {
        type: 'COMBOBOX',
        key: 'combobox-field',
        label: 'Combobox',
        required: true,
        options: [
          {
            label: 'combobox1',
            value: 'combobox1',
          },
          {
            label: 'combobox2',
            value: 'combobox2',
          },
        ],
        inputType: 'MULTI_SELECT',
      };
      const result = returnMultiSelectCollector(comboField, 1, []);
      expect(result.type).toBe('MultiSelectCollector');
      expect(result.output).toHaveProperty('value', []);
    });
  });
});

describe('Object value collectors', () => {
  describe('returnDeviceAuthenticationCollector', () => {
    const mockField: DeviceAuthenticationField = {
      key: 'device-auth-key',
      label: 'Device Authentication',
      type: 'DEVICE_AUTHENTICATION',
      options: [
        {
          type: 'device1',
          iconSrc: 'icon1.png',
          title: 'Device 1',
          id: '123123',
          default: true,
          description: 'device1-value',
        },
        {
          type: 'device2',
          iconSrc: 'icon2.png',
          title: 'Device 2',
          id: '345345',
          default: false,
          description: 'device2-value',
        },
      ],
      required: true,
    };

    const transformedDevices = mockField.options.map((device) => ({
      label: device.title,
      value: device.id,
      content: device.description,
      type: device.type,
      key: device.id,
      default: device.default,
    }));

    it('should create a valid DeviceAuthenticationCollector', () => {
      const result = returnObjectSelectCollector(mockField, 1);
      expect(result).toEqual({
        category: 'ObjectValueCollector',
        error: null,
        type: 'DeviceAuthenticationCollector',
        id: 'device-auth-key-1',
        name: 'device-auth-key',
        input: {
          key: mockField.key,
          value: {
            id: '123123',
            type: 'device1',
            value: 'device1-value',
          },
          type: mockField.type,
        },
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
          options: transformedDevices,
          value: {
            id: '123123',
            type: 'device1',
            value: 'device1-value',
          },
        },
      });
    });
  });

  describe('returnDeviceRegistrationCollector', () => {
    const mockField: DeviceRegistrationField = {
      key: 'device-reg-key',
      label: 'Device Registration',
      type: 'DEVICE_REGISTRATION',
      options: [
        {
          type: 'device1',
          iconSrc: 'icon1.png',
          title: 'Device 1',
          description: 'Device 1 Description',
        },
        {
          type: 'device2',
          iconSrc: 'icon2.png',
          title: 'Device 2',
          description: 'Device 2 Description',
        },
      ],
      required: true,
    };

    const transformedDevices = mockField.options.map((device, idx) => ({
      label: device.title,
      value: device.type,
      content: device.description,
      type: device.type,
      key: `${device.type}-${idx}`,
    }));

    it('should create a valid DeviceRegistrationCollector', () => {
      const result = returnObjectSelectCollector(mockField, 1);
      expect(result).toEqual({
        category: 'ObjectValueCollector',
        error: null,
        type: 'DeviceRegistrationCollector',
        id: 'device-reg-key-1',
        name: 'device-reg-key',
        input: {
          key: mockField.key,
          value: '',
          type: mockField.type,
        },
        output: {
          key: mockField.key,
          label: mockField.label,
          type: mockField.type,
          options: transformedDevices,
        },
      });
    });
  });
});

describe('returnPhoneNumberCollector', () => {
  const mockField: PhoneNumberField = {
    key: 'phone-number-key',
    defaultCountryCode: null,
    label: 'Phone Number',
    type: 'PHONE_NUMBER',
    required: true,
  };

  it('should create a phone number collector', () => {
    const result = returnObjectValueCollector(mockField, 1);
    expect(result).toEqual({
      category: 'ObjectValueCollector',
      error: null,
      type: 'PhoneNumberCollector',
      id: 'phone-number-key-1',
      name: 'phone-number-key',
      input: {
        key: mockField.key,
        value: {
          countryCode: '',
          phoneNumber: '',
        },
        type: mockField.type,
      },
      output: {
        key: mockField.key,
        label: mockField.label,
        type: mockField.type,
        value: {
          countryCode: '',
          phoneNumber: '',
        },
      },
    });
  });
});

describe('No Value Collectors', () => {
  const mockField: ReadOnlyField = {
    content: 'Test Label',
    type: 'LABEL',
  };

  describe('returnNoValueCollector', () => {
    it('should return a valid NoValueCollector with value in output', () => {
      const result = returnNoValueCollector(mockField, 0, 'NoValueCollector');
      expect(result).toEqual({
        category: 'NoValueCollector',
        error: null,
        type: 'NoValueCollector',
        id: 'LABEL-0',
        name: 'LABEL-0',
        output: {
          key: 'LABEL-0',
          label: mockField.content,
          type: mockField.type,
        },
      });
    });
  });

  describe('returnReadOnlyCollector', () => {
    it('should return a valid ReadOnlyCollector with value in output', () => {
      const result = returnReadOnlyCollector(mockField, 0);
      expect(result).toEqual({
        category: 'NoValueCollector',
        error: null,
        type: 'ReadOnlyCollector',
        id: 'LABEL-0',
        name: 'LABEL-0',
        output: {
          key: 'LABEL-0',
          label: mockField.content,
          type: mockField.type,
        },
      });
    });
  });
});

describe('Return collector validator', () => {
  const validatedTextCollector = {
    input: {
      validation: [
        { type: 'required', message: 'This field is required' },
        { type: 'regex', message: 'Invalid format', rule: '^[a-zA-Z0-9]+$' },
      ],
    },
  } as ValidatedTextCollector;

  const validator = returnValidator(validatedTextCollector);

  it('should return an error message for required validation when value is empty', () => {
    const result = validator('');
    expect(result).toContain('This field is required');
  });

  it('should return an error message for regex validation when value does not match the pattern', () => {
    const result = validator('invalid_value!');
    expect(result).toContain('Invalid format');
  });

  it('should return no error messages when value passes all validations', () => {
    const result = validator('validValue123');
    expect(result).toEqual([]);
  });

  it('should handle invalid regex patterns gracefully', () => {
    const invalidRegexCollector = {
      input: {
        validation: [{ type: 'regex', message: 'Invalid regex', rule: '[invalid' }],
      },
    } as ValidatedTextCollector;

    const invalidRegexValidator = returnValidator(invalidRegexCollector);
    const result = invalidRegexValidator('test');
    expect(result).toContain(
      'Invalid regular expression: /[invalid/: Unterminated character class',
    );
  });
});
