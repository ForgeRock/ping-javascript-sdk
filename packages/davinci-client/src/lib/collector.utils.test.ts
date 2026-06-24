/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
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
  returnValidatedPasswordCollector,
  returnTextCollector,
  returnSingleSelectCollector,
  returnMultiSelectCollector,
  returnValidator,
  returnReadOnlyCollector,
  returnNoValueCollector,
  returnObjectSelectCollector,
  returnObjectValueCollector,
  returnSingleValueAutoCollector,
  returnObjectValueAutoCollector,
  returnImageCollector,
  returnQrCodeCollector,
  normalizeReplacements,
  returnBooleanCollector,
  returnValidatedBooleanCollector,
} from './collector.utils.js';
import { returnPasswordPolicyValidator } from './password-policy.rules.js';
import type {
  DaVinciField,
  DeviceAuthenticationField,
  DeviceRegistrationField,
  ImageField,
  PasswordField,
  FidoAuthenticationField,
  FidoRegistrationField,
  PhoneNumberExtensionField,
  PhoneNumberField,
  ProtectField,
  QrCodeField,
  PollingField,
  ReadOnlyField,
  RedirectField,
  RichContentReplacement,
  SingleCheckboxField,
  StandardField,
  AgreementField,
} from './davinci.types.js';
import type {
  BooleanCollector,
  MultiSelectCollector,
  PhoneNumberCollector,
  PhoneNumberExtensionCollector,
  PhoneNumberOutputValue,
  PhoneNumberExtensionOutputValue,
  RichTextCollector,
  ValidatedBooleanCollector,
  ValidatedTextCollector,
} from './collector.types.js';

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
          verify: false,
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
      const passwordField: PasswordField = {
        type: 'PASSWORD',
        key: 'password',
        label: 'Password',
      };
      const result = returnPasswordCollector(passwordField, 1);
      expect(result.type).toBe('PasswordCollector');
      expect(result.output).not.toHaveProperty('value');
      expect(result.output.verify).toBe(false);
    });

    it('propagates verify: true from a PASSWORD field onto the PasswordCollector', () => {
      const passwordField: PasswordField = {
        type: 'PASSWORD',
        key: 'password',
        label: 'Password',
        verify: true,
      };
      const result = returnPasswordCollector(passwordField, 1);
      expect(result.output.verify).toBe(true);
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
      expect(result.input).toHaveProperty('validation');
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
      required: false,
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
          validation: null,
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
          validation: [
            {
              message: 'Value cannot be empty',
              rule: true,
              type: 'required',
            },
          ],
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

describe('returnObjectValueCollector with phone fields', () => {
  it('input value is empty when no prefill or default country code', () => {
    const mockField: PhoneNumberField = {
      key: 'phone-number-key',
      defaultCountryCode: null,
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: true,
      validatePhoneNumber: true,
    };

    const result = returnObjectValueCollector(mockField, 1, {});
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
        validation: [
          {
            message: 'Value cannot be empty',
            rule: true,
            type: 'required',
          },
          {
            message: 'Phone number should be validated',
            rule: true,
            type: 'validatePhoneNumber',
          },
        ],
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

  it('default country code is set on collector when not prefilled', () => {
    const mockField: PhoneNumberField = {
      key: 'phone-number-key',
      defaultCountryCode: 'US',
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
    };
    const result = returnObjectValueCollector(mockField, 1, {});
    expect(result).toEqual({
      category: 'ObjectValueCollector',
      error: null,
      type: 'PhoneNumberCollector',
      id: 'phone-number-key-1',
      name: 'phone-number-key',
      input: {
        key: mockField.key,
        value: {
          countryCode: mockField.defaultCountryCode,
          phoneNumber: '',
        },
        type: mockField.type,
        validation: null,
      },
      output: {
        key: mockField.key,
        label: mockField.label,
        type: mockField.type,
        value: {
          countryCode: mockField.defaultCountryCode,
          phoneNumber: '',
        },
      },
    });
  });

  it('prefilled country code is set on collector', () => {
    const mockField: PhoneNumberField = {
      key: 'phone-number-key',
      defaultCountryCode: 'US',
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
    };
    const prefillMock: PhoneNumberOutputValue = {
      countryCode: 'CA',
    };
    const result = returnObjectValueCollector(mockField, 1, prefillMock);
    expect(result).toEqual({
      category: 'ObjectValueCollector',
      error: null,
      type: 'PhoneNumberCollector',
      id: 'phone-number-key-1',
      name: 'phone-number-key',
      input: {
        key: mockField.key,
        value: {
          countryCode: prefillMock.countryCode,
          phoneNumber: '',
        },
        type: mockField.type,
        validation: null,
      },
      output: {
        key: mockField.key,
        label: mockField.label,
        type: mockField.type,
        value: {
          countryCode: prefillMock.countryCode,
          phoneNumber: '',
        },
      },
    });
    expect(result.input.value.countryCode).not.toEqual(mockField.defaultCountryCode);
    expect(result.output.value?.countryCode).not.toEqual(mockField.defaultCountryCode);
  });

  it('prefilled phone number is set on collector', () => {
    const mockField: PhoneNumberField = {
      key: 'phone-number-key',
      defaultCountryCode: null,
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
    };
    const prefillMock: PhoneNumberOutputValue = {
      phoneNumber: '1234567890',
    };
    const result = returnObjectValueCollector(mockField, 1, prefillMock);
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
          phoneNumber: prefillMock.phoneNumber,
        },
        type: mockField.type,
        validation: null,
      },
      output: {
        key: mockField.key,
        label: mockField.label,
        type: mockField.type,
        value: {
          countryCode: '',
          phoneNumber: prefillMock.phoneNumber,
        },
      },
    });
  });

  it('prefilled values are set on collector', () => {
    const mockField: PhoneNumberField = {
      key: 'phone-number-key',
      defaultCountryCode: 'US',
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
    };
    const prefillMock: PhoneNumberOutputValue = {
      countryCode: 'CA',
      phoneNumber: '1234567890',
    };
    const result = returnObjectValueCollector(mockField, 1, prefillMock);
    expect(result).toEqual({
      category: 'ObjectValueCollector',
      error: null,
      type: 'PhoneNumberCollector',
      id: 'phone-number-key-1',
      name: 'phone-number-key',
      input: {
        key: mockField.key,
        value: {
          countryCode: prefillMock.countryCode,
          phoneNumber: prefillMock.phoneNumber,
        },
        type: mockField.type,
        validation: null,
      },
      output: {
        key: mockField.key,
        label: mockField.label,
        type: mockField.type,
        value: {
          countryCode: prefillMock.countryCode,
          phoneNumber: prefillMock.phoneNumber,
        },
      },
    });
  });

  it('showExtension true returns PhoneNumberExtensionCollector', () => {
    const mockField: PhoneNumberExtensionField = {
      key: 'phone-number-key',
      defaultCountryCode: null,
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
      showExtension: true,
      extensionLabel: 'Extension',
    };
    const result = returnObjectValueCollector(mockField, 1, {});
    expect(result.type).toBe('PhoneNumberExtensionCollector');
  });

  it('creates a full PhoneNumberExtensionCollector with all fields', () => {
    const mockField: PhoneNumberExtensionField = {
      key: 'phone-number-key',
      defaultCountryCode: 'US',
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: true,
      validatePhoneNumber: true,
      showExtension: true,
      extensionLabel: 'Extension',
    };
    const result = returnObjectValueCollector(mockField, 1, {}) as PhoneNumberExtensionCollector;
    expect(result).toEqual({
      category: 'ObjectValueCollector',
      error: null,
      type: 'PhoneNumberExtensionCollector',
      id: 'phone-number-key-1',
      name: 'phone-number-key',
      input: {
        key: mockField.key,
        value: {
          countryCode: 'US',
          phoneNumber: '',
          extension: '',
        },
        type: mockField.type,
        validation: [
          {
            message: 'Value cannot be empty',
            rule: true,
            type: 'required',
          },
          {
            message: 'Phone number should be validated',
            rule: true,
            type: 'validatePhoneNumber',
          },
        ],
      },
      output: {
        key: mockField.key,
        label: mockField.label,
        type: mockField.type,
        extensionLabel: 'Extension',
        value: {
          countryCode: 'US',
          phoneNumber: '',
          extension: '',
        },
      },
    });
  });

  it('prefilled extension is set on collector', () => {
    const mockField: PhoneNumberExtensionField = {
      key: 'phone-number-key',
      defaultCountryCode: null,
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
      showExtension: true,
      extensionLabel: 'Extension',
    };
    const prefillMock: PhoneNumberExtensionOutputValue = {
      phoneNumber: '1234567890',
      extension: '123',
    };
    const result = returnObjectValueCollector(
      mockField,
      1,
      prefillMock,
    ) as PhoneNumberExtensionCollector;
    expect(result.input.value.extension).toBe('123');
    expect(result.output.value?.extension).toBe('123');
    expect(result.output.extensionLabel).toBe('Extension');
  });

  it('PhoneNumberCollector does not have extensionLabel in output', () => {
    const mockField: PhoneNumberField = {
      key: 'phone-number-key',
      defaultCountryCode: null,
      label: 'Phone Number',
      type: 'PHONE_NUMBER',
      required: false,
      validatePhoneNumber: false,
    };
    const result = returnObjectValueCollector(mockField, 1, {});
    expect(result.output).not.toHaveProperty('extensionLabel');
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
    it('should return a ReadOnlyCollector with plain content when no richContent on field', () => {
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
          content: mockField.content,
        },
      });
    });

    it('should return a RichTextCollector when richContent is present', () => {
      const field: ReadOnlyField = {
        type: 'LABEL',
        content: 'I agree to the terms and conditions',
        richContent: {
          content: 'I agree to the {{link}}',
          replacements: {
            link: {
              type: 'link',
              value: 'terms and conditions',
              href: 'https://example.com',
              target: '_blank',
            },
          },
        },
        key: 'terms',
      };

      const result = returnReadOnlyCollector(field, 0);

      expect(result).toEqual({
        category: 'NoValueCollector',
        error: null,
        type: 'RichTextCollector',
        id: 'terms-0',
        name: 'terms-0',
        output: {
          key: 'terms-0',
          label: 'I agree to the terms and conditions',
          type: 'LABEL',
          content: 'I agree to the terms and conditions',
          richContent: {
            content: 'I agree to the {{link}}',
            replacements: [
              {
                key: 'link',
                type: 'link',
                value: 'terms and conditions',
                href: 'https://example.com',
                target: '_blank',
              },
            ],
          },
        },
      });
    });

    it('should pass through unsafe-looking hrefs unchanged (consumer is responsible for sanitization)', () => {
      const field: ReadOnlyField = {
        type: 'LABEL',
        content: 'Click the link',
        richContent: {
          content: 'Click {{bad}}',
          replacements: {
            bad: {
              type: 'link',
              value: 'here',
              href: 'javascript:alert(1)',
            },
          },
        },
      };

      const result = returnReadOnlyCollector(field, 0) as RichTextCollector;

      expect(result.error).toBeNull();
      expect(result.type).toBe('RichTextCollector');
      expect(result.output.richContent).toEqual({
        content: 'Click {{bad}}',
        replacements: [{ key: 'bad', type: 'link', value: 'here', href: 'javascript:alert(1)' }],
      });
    });
  });
});

describe('returnQrCodeCollector', () => {
  it('should return a valid QrCodeCollector with src and label from fallbackText', () => {
    const mockField: QrCodeField = {
      type: 'QR_CODE',
      key: 'qr-code-field',
      content: 'data:image/png;base64,abc123',
      fallbackText: '04ZKS2KCIWKXT8FHRX',
    };
    const result = returnQrCodeCollector(mockField, 2);
    expect(result).toEqual({
      category: 'NoValueCollector',
      error: null,
      type: 'QrCodeCollector',
      id: 'qr-code-field-2',
      name: 'qr-code-field-2',
      output: {
        key: 'qr-code-field-2',
        label: '04ZKS2KCIWKXT8FHRX',
        type: 'QR_CODE',
        src: 'data:image/png;base64,abc123',
      },
    });
  });

  it('should handle missing fallbackText gracefully', () => {
    const mockField: QrCodeField = {
      type: 'QR_CODE',
      key: 'qr-code-field',
      content: 'data:image/png;base64,abc123',
    };
    const result = returnQrCodeCollector(mockField, 0);
    expect(result).toEqual({
      category: 'NoValueCollector',
      error: null,
      type: 'QrCodeCollector',
      id: 'qr-code-field-0',
      name: 'qr-code-field-0',
      output: {
        key: 'qr-code-field-0',
        label: '',
        type: 'QR_CODE',
        src: 'data:image/png;base64,abc123',
      },
    });
  });

  it('should set error when content is missing', () => {
    const mockField = { type: 'QR_CODE', key: 'qr-code-field' } as unknown as QrCodeField;
    const result = returnQrCodeCollector(mockField, 0);
    expect(result.error).toContain('Content is not found');
    expect(result.output.src).toBe('');
  });

  it('should fall back to type for id/name when key is missing', () => {
    const mockField = {
      type: 'QR_CODE',
      content: 'data:image/png;base64,abc123',
    } as unknown as QrCodeField;
    const result = returnQrCodeCollector(mockField, 0);
    expect(result.error).toBeNull();
    expect(result.id).toBe('QR_CODE-0');
    expect(result.name).toBe('QR_CODE-0');
  });

  it('should only report content error when both key and content are missing', () => {
    const mockField = { type: 'QR_CODE' } as unknown as QrCodeField;
    const result = returnQrCodeCollector(mockField, 0);
    expect(result.error).toContain('Content is not found');
  });
});

describe('returnImageCollector', () => {
  // (a) Full payload — all five SDK contract fields present
  it('should return a fully-populated ImageCollector when all contract fields are present', () => {
    const mockField: ImageField = {
      type: 'IMAGE',
      key: 'heroImage',
      imageUrl: 'https://cdn.example.com/image.png',
      description: 'Alt text',
      hyperlinkUrl: 'https://example.com/install',
    };
    const result = returnImageCollector(mockField, 1);
    expect(result).toEqual({
      category: 'NoValueCollector',
      error: null,
      type: 'ImageCollector',
      id: 'heroImage-1',
      name: 'heroImage-1',
      output: {
        key: 'heroImage-1',
        label: 'Alt text',
        type: 'IMAGE',
        src: 'https://cdn.example.com/image.png',
        alt: 'Alt text',
        href: 'https://example.com/install',
      },
    });
  });

  // (b) Minimal payload — no hyperlinkUrl
  it('should omit href when hyperlinkUrl is absent', () => {
    const mockField: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: 'Alt text',
      imageUrl: 'https://example.com/test-image.png',
    };
    const result = returnImageCollector(mockField, 0);
    expect(result.error).toBeNull();
    expect(result.output.src).toBe('https://example.com/test-image.png');
    expect(result.output.alt).toBe('Alt text');
    expect(result.output.label).toBe('Alt text');
    expect(result.output).not.toHaveProperty('href');
  });

  // (c) hyperlinkUrl present — href emitted; absent — omitted
  it('should emit href when hyperlinkUrl is set and omit it when absent', () => {
    const withHyperlink: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: 'Alt text',
      imageUrl: 'https://example.com/test-image.png',
      hyperlinkUrl: 'https://example.com/click-target',
    };
    const resultWith = returnImageCollector(withHyperlink, 0);
    expect(resultWith.output.href).toBe('https://example.com/click-target');

    const withoutHyperlink: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: 'Alt text',
      imageUrl: 'https://example.com/test-image.png',
    };
    const resultWithout = returnImageCollector(withoutHyperlink, 0);
    expect(resultWithout.output).not.toHaveProperty('href');
  });

  // (d) alt passes through verbatim as alt and label
  it('should pass alt through verbatim as alt and label', () => {
    const mockField: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: 'Friendly alt text',
      imageUrl: 'https://example.com/test-image.png',
    };
    const result = returnImageCollector(mockField, 0);
    expect(result.output.alt).toBe('Friendly alt text');
    expect(result.output.label).toBe('Friendly alt text');
  });

  // (e) imageUrl absent — src defaults to empty string
  it('should default src to empty string when imageUrl is absent', () => {
    const mockField: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: 'Alt text',
      imageUrl: '',
    };
    const result = returnImageCollector(mockField, 0);
    expect(result.output.src).toBe('');
  });

  // (f) output.label mirrors alt
  it('should set output.label to alt when present, empty string when absent', () => {
    const withAlt: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: 'Alt text',
      imageUrl: 'https://example.com/test-image.png',
    };
    expect(returnImageCollector(withAlt, 0).output.label).toBe('Alt text');

    const withoutAlt: ImageField = {
      type: 'IMAGE',
      key: 'image',
      description: '',
      imageUrl: 'https://example.com/test-image.png',
    };
    expect(returnImageCollector(withoutAlt, 0).output.label).toBe('');
  });
});

describe('returnReadOnlyCollector with AGREEMENT field', () => {
  it('should return a valid ReadOnlyCollector with content and title', () => {
    const mockField: AgreementField = {
      type: 'AGREEMENT',
      key: 'agreement-field',
      content: 'Please accept the terms and conditions',
      titleEnabled: true,
      title: 'Terms and Conditions',
      agreement: {
        id: 'agreement-123',
        useDynamicAgreement: false,
      },
      enabled: true,
    };
    const result = returnReadOnlyCollector(mockField, 0);
    expect(result).toEqual({
      category: 'NoValueCollector',
      error: null,
      type: 'ReadOnlyCollector',
      id: 'agreement-field-0',
      name: 'agreement-field-0',
      output: {
        key: 'agreement-field-0',
        label: 'Please accept the terms and conditions',
        type: 'AGREEMENT',
        content: 'Please accept the terms and conditions',
        title: 'Terms and Conditions',
      },
    });
  });

  it('should return a ReadOnlyCollector with no title when title is disabled', () => {
    const mockField: AgreementField = {
      type: 'AGREEMENT',
      key: 'agreement-field',
      content: 'Please accept the terms and conditions',
      titleEnabled: false,
      title: 'Sample Title',
      agreement: {
        id: 'agreement-123',
        useDynamicAgreement: false,
      },
      enabled: true,
    };
    const result = returnReadOnlyCollector(mockField, 0);
    expect(result).toEqual({
      category: 'NoValueCollector',
      error: null,
      type: 'ReadOnlyCollector',
      id: 'agreement-field-0',
      name: 'agreement-field-0',
      output: {
        key: 'agreement-field-0',
        label: 'Please accept the terms and conditions',
        type: 'AGREEMENT',
        content: 'Please accept the terms and conditions',
      },
    });
    expect(result.output).not.toHaveProperty('title');
  });

  it('should set error when content is missing', () => {
    const mockField = { type: 'AGREEMENT', key: 'agreement-field' } as unknown as AgreementField;
    const result = returnReadOnlyCollector(mockField, 0);
    expect(result.error).toContain('Content is not found');
  });
});

describe('returnSingleValueAutoCollector', () => {
  it('should create a valid ProtectCollector', () => {
    const mockField: ProtectField = {
      type: 'PROTECT',
      key: 'protect-key',
      behavioralDataCollection: true,
      universalDeviceIdentification: false,
    };
    const result = returnSingleValueAutoCollector(mockField, 1, 'ProtectCollector');
    expect(result).toEqual({
      category: 'SingleValueAutoCollector',
      error: null,
      type: 'ProtectCollector',
      id: 'protect-key-1',
      name: 'protect-key',
      input: {
        key: mockField.key,
        value: '',
        type: mockField.type,
      },
      output: {
        key: mockField.key,
        type: mockField.type,
        config: {
          behavioralDataCollection: mockField.behavioralDataCollection,
          universalDeviceIdentification: mockField.universalDeviceIdentification,
        },
      },
    });
  });

  it('should create a valid PollingCollector', () => {
    const mockField: PollingField = {
      type: 'POLLING',
      key: 'polling-key',
      pollInterval: 2000,
      pollRetries: 20,
      pollChallengeStatus: true,
      challenge: 'hlMtnk2RsPtnlYs2n1IiS9qhTZQLK-AOHNAo8-F3eY0',
    };
    const result = returnSingleValueAutoCollector(mockField, 1, 'PollingCollector');
    expect(result).toEqual({
      category: 'SingleValueAutoCollector',
      error: null,
      type: 'PollingCollector',
      id: 'polling-key-1',
      name: 'polling-key',
      input: {
        key: mockField.key,
        value: '',
        type: mockField.type,
      },
      output: {
        key: mockField.key,
        type: mockField.type,
        config: {
          pollInterval: 2000,
          pollRetries: 20,
          pollChallengeStatus: true,
          challenge: 'hlMtnk2RsPtnlYs2n1IiS9qhTZQLK-AOHNAo8-F3eY0',
        },
      },
    });
  });
});

describe('returnObjectValueAutoCollector', () => {
  it('should create a valid FidoRegistrationCollector', () => {
    const mockField: FidoRegistrationField = {
      type: 'FIDO2',
      key: 'fido2',
      label: 'Register your security key',
      action: 'REGISTER',
      trigger: 'BUTTON',
      required: true,
      publicKeyCredentialCreationOptions: {
        rp: {
          name: 'Example RP',
          id: 'example.com',
        },
        user: {
          id: [1],
          displayName: 'Test User',
          name: 'testuser',
        },
        challenge: [1, 2, 3, 4],
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7,
          },
        ],
        timeout: 60000,
        authenticatorSelection: {
          residentKey: 'required',
          requireResidentKey: true,
          userVerification: 'required',
        },
        attestation: 'none',
        extensions: {
          credProps: true,
          hmacCreateSecret: true,
        },
      },
    };
    const result = returnObjectValueAutoCollector(mockField, 1, 'FidoRegistrationCollector');
    expect(result).toEqual({
      category: 'ObjectValueAutoCollector',
      error: null,
      type: 'FidoRegistrationCollector',
      id: 'fido2-1',
      name: 'fido2',
      input: {
        key: mockField.key,
        value: {},
        type: mockField.type,
        validation: [
          {
            message: 'Value cannot be empty',
            rule: true,
            type: 'required',
          },
        ],
      },
      output: {
        key: mockField.key,
        type: mockField.type,
        config: {
          publicKeyCredentialCreationOptions: mockField.publicKeyCredentialCreationOptions,
          action: mockField.action,
          trigger: mockField.trigger,
        },
      },
    });
  });

  it('should create a valid FidoAuthenticationCollector', () => {
    const mockField: FidoAuthenticationField = {
      type: 'FIDO2',
      key: 'fido2',
      label: 'Authenticate with your security key',
      action: 'AUTHENTICATE',
      trigger: 'BUTTON',
      required: false,
      publicKeyCredentialRequestOptions: {
        challenge: [1, 2, 3, 4],
        timeout: 60000,
        rpId: 'example.com',
        allowCredentials: [
          {
            type: 'public-key',
            id: [1, 2, 3, 4],
          },
        ],
        userVerification: 'preferred',
      },
    };
    const result = returnObjectValueAutoCollector(mockField, 1, 'FidoAuthenticationCollector');
    expect(result).toEqual({
      category: 'ObjectValueAutoCollector',
      error: null,
      type: 'FidoAuthenticationCollector',
      id: 'fido2-1',
      name: 'fido2',
      input: {
        key: mockField.key,
        value: {},
        type: mockField.type,
        validation: null,
      },
      output: {
        key: mockField.key,
        type: mockField.type,
        config: {
          publicKeyCredentialRequestOptions: mockField.publicKeyCredentialRequestOptions,
          action: mockField.action,
          trigger: mockField.trigger,
        },
      },
    });
  });
});

describe('Return collector validator', () => {
  const validatedTextCollector = {
    input: {
      validation: [
        { type: 'required', message: 'This field is required', rule: true },
        { type: 'regex', message: 'Invalid format', rule: '^[a-zA-Z0-9]+$' },
      ],
    },
  } as ValidatedTextCollector;

  const objectValueCollector = {
    input: {
      validation: [
        { type: 'required', message: 'This field is required', rule: true },
        { type: 'validatePhoneNumber', message: 'Phone number should be validated', rule: true },
      ],
    },
  } as PhoneNumberCollector;

  const multiValueCollector = {
    input: {
      validation: [{ type: 'required', message: 'This field is required', rule: true }],
    },
  } as MultiSelectCollector;

  const validator = returnValidator(validatedTextCollector);
  const objValidator = returnValidator(objectValueCollector);
  const multiValueValidator = returnValidator(multiValueCollector);

  it('should return an error message for required validation when value is empty', () => {
    const result = validator('');
    expect(result).toContain('This field is required');

    // @ts-expect-error - intentionally passing empty object to test required validation
    const objResult = objValidator({});
    expect(objResult).toContain('This field is required');

    const multiValueResult = multiValueValidator([]);
    expect(multiValueResult).toContain('This field is required');
  });

  it('should return an error message for regex validation when value does not match the pattern', () => {
    const result = validator('invalid_value!');
    expect(result).toContain('Invalid format');
  });

  it('should return no error messages when value passes all validations', () => {
    const result = validator('validValue123');
    expect(result).toEqual([]);

    const objResult = objValidator({ countryCode: 'US', phoneNumber: '1234567890' });
    expect(objResult).toEqual([]);

    const multiValueResult = multiValueValidator(['a', 'b', 'c']);
    expect(multiValueResult).toEqual([]);
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

  describe('ValidatedBooleanCollector', () => {
    const booleanCollector = {
      input: {
        validation: [{ type: 'required', message: 'This field is required', rule: true }],
      },
    } as ValidatedBooleanCollector;

    const booleanValidator = returnValidator(booleanCollector);

    it('should return an error when value is false (unchecked)', () => {
      const result = booleanValidator(false);
      expect(result).toContain('This field is required');
    });

    it('should return no errors when value is true (checked)', () => {
      const result = booleanValidator(true);
      expect(result).toEqual([]);
    });
  });
});

describe('normalizeReplacements', () => {
  it('should flatten a single link replacement', () => {
    const replacements: Record<string, RichContentReplacement> = {
      link1: {
        type: 'link',
        value: 'terms and conditions',
        href: 'https://example.com',
        target: '_blank',
      },
    };

    expect(normalizeReplacements(replacements)).toEqual([
      {
        key: 'link1',
        type: 'link',
        value: 'terms and conditions',
        href: 'https://example.com',
        target: '_blank',
      },
    ]);
  });

  it('should flatten multiple link replacements', () => {
    const replacements: Record<string, RichContentReplacement> = {
      link1: {
        type: 'link',
        value: 'terms',
        href: 'https://example.com',
        target: '_blank',
      },
      link2: {
        type: 'link',
        value: 'policy',
        href: 'https://xyz.com',
        target: '_self',
      },
    };

    expect(normalizeReplacements(replacements)).toEqual([
      {
        key: 'link1',
        type: 'link',
        value: 'terms',
        href: 'https://example.com',
        target: '_blank',
      },
      { key: 'link2', type: 'link', value: 'policy', href: 'https://xyz.com', target: '_self' },
    ]);
  });

  it('should omit target when not provided', () => {
    const replacements: Record<string, RichContentReplacement> = {
      link: {
        type: 'link',
        value: 'here',
        href: 'https://example.com',
      },
    };

    expect(normalizeReplacements(replacements)).toEqual([
      { key: 'link', type: 'link', value: 'here', href: 'https://example.com' },
    ]);
  });

  it('should return empty array for empty replacements', () => {
    expect(normalizeReplacements({})).toEqual([]);
  });

  it('should pass non-http(s) hrefs through unchanged', () => {
    const replacements: Record<string, RichContentReplacement> = {
      link: {
        type: 'link',
        value: 'here',
        href: 'javascript:alert(1)',
      },
    };

    expect(normalizeReplacements(replacements)).toEqual([
      { key: 'link', type: 'link', value: 'here', href: 'javascript:alert(1)' },
    ]);
  });
});

describe('Terms and Conditions Integration', () => {
  it('should handle a form with a checkbox and a label with a T&C link', () => {
    const labelField: ReadOnlyField = {
      type: 'LABEL',
      content: 'I agree to the terms and conditions',
      richContent: {
        content: 'I agree to the {{link}}',
        replacements: {
          link: {
            type: 'link',
            value: 'terms and conditions',
            href: 'https://example.com/terms',
            target: '_blank',
          },
        },
      },
      key: 'terms-label',
    };

    const checkboxField = {
      type: 'CHECKBOX' as const,
      key: 'agree-checkbox',
      label: 'Agreement',
      required: true,
      options: [{ label: 'I agree', value: 'agree' }],
      inputType: 'MULTI_SELECT' as const,
    };

    const labelCollector = returnReadOnlyCollector(labelField, 0) as RichTextCollector;
    const checkboxCollector = returnMultiSelectCollector(checkboxField, 1, []);

    // Verify label collector has pass-through richContent
    expect(labelCollector.type).toBe('RichTextCollector');
    expect(labelCollector.category).toBe('NoValueCollector');
    expect(labelCollector.error).toBeNull();
    expect(labelCollector.output.label).toBe('I agree to the terms and conditions');
    expect(labelCollector.output.content).toBe('I agree to the terms and conditions');
    expect(labelCollector.output.richContent).toEqual({
      content: 'I agree to the {{link}}',
      replacements: [
        {
          key: 'link',
          type: 'link',
          value: 'terms and conditions',
          href: 'https://example.com/terms',
          target: '_blank',
        },
      ],
    });

    // Verify checkbox collector works alongside
    expect(checkboxCollector.type).toBe('MultiSelectCollector');
    expect(checkboxCollector.category).toBe('MultiValueCollector');
    expect(checkboxCollector.error).toBeNull();
    expect(checkboxCollector.output.options).toEqual([{ label: 'I agree', value: 'agree' }]);
    expect(checkboxCollector.input.value).toEqual([]);
    expect(checkboxCollector.input.validation).toEqual([
      { type: 'required', message: 'Value cannot be empty', rule: true },
    ]);
  });
});

describe('returnValidatedPasswordCollector', () => {
  const mockPasswordPolicy = {
    id: '39cad7af-3c2f-4672-9c3f-c47e5169e582',
    name: 'Standard',
    length: { min: 8, max: 255 },
    minCharacters: {
      '~!@#$%^&*()-_=+[]{}|;:,.<>/?': 1,
      '0123456789': 1,
      ABCDEFGHIJKLMNOPQRSTUVWXYZ: 1,
      abcdefghijklmnopqrstuvwxyz: 1,
    },
  };

  it('should create a ValidatedPasswordCollector with embedded passwordPolicy', () => {
    const field: PasswordField = {
      type: 'PASSWORD_VERIFY',
      key: 'user.password',
      label: 'Password',
      required: true,
      passwordPolicy: mockPasswordPolicy,
    };

    const result = returnValidatedPasswordCollector(field, 0);

    expect(result).toEqual({
      category: 'SingleValueCollector',
      error: null,
      type: 'ValidatedPasswordCollector',
      id: 'user.password-0',
      name: 'user.password',
      input: {
        key: 'user.password',
        value: '',
        type: 'PASSWORD_VERIFY',
        validation: mockPasswordPolicy,
      },
      output: {
        key: 'user.password',
        label: 'Password',
        type: 'PASSWORD_VERIFY',
        verify: false,
      },
    });
  });

  it('should propagate verify: true from the field onto the collector', () => {
    const field: PasswordField = {
      type: 'PASSWORD_VERIFY',
      key: 'user.password',
      label: 'Password',
      verify: true,
      passwordPolicy: mockPasswordPolicy,
    };

    const result = returnValidatedPasswordCollector(field, 0);

    expect(result.output.verify).toBe(true);
  });

  it('should fall back to an empty policy when called directly with a field that has no policy', () => {
    // The reducer selects returnPasswordCollector when a field has no passwordPolicy (for both
    // PASSWORD and PASSWORD_VERIFY types), so this field would normally never reach
    // returnValidatedPasswordCollector. This test exercises the factory's defensive fallback
    // directly, covering callers who bypass the reducer and invoke it without a policy attached.
    const field: PasswordField = {
      type: 'PASSWORD_VERIFY',
      key: 'user.password',
      label: 'Password',
    };

    const result = returnValidatedPasswordCollector(field, 1);

    expect(result.input.validation).toEqual({});
    expect(result.output.verify).toBe(false);
  });

  it('should record errors when field is missing properties', () => {
    const invalidField = {} as PasswordField;
    const result = returnValidatedPasswordCollector(invalidField, 0);
    expect(result.error).toContain('Key is not found');
    expect(result.error).toContain('Label is not found');
    expect(result.error).toContain('Type is not found');
  });
});

describe('returnPasswordPolicyValidator', () => {
  const makeCollector = (passwordPolicy?: Record<string, unknown>) => {
    const field: PasswordField = {
      type: 'PASSWORD_VERIFY',
      key: 'user.password',
      label: 'Password',
      ...(passwordPolicy && { passwordPolicy }),
    } as PasswordField;
    return returnValidatedPasswordCollector(field, 0);
  };

  it('should return an empty array when the collector has no passwordPolicy', () => {
    const validate = returnPasswordPolicyValidator(makeCollector());
    expect(validate('anything')).toEqual([]);
  });

  it('should return an empty array when the value satisfies all policy rules', () => {
    const validate = returnPasswordPolicyValidator(
      makeCollector({
        length: { min: 8, max: 20 },
        minUniqueCharacters: 5,
        maxRepeatedCharacters: 2,
        minCharacters: { '0123456789': 1, '!@#$%^&*()': 1 },
      }),
    );
    expect(validate('Valid1@Password')).toEqual([]);
  });

  describe('length rule', () => {
    it('should fail with a range message when value is shorter than length.min and max is set', () => {
      const validate = returnPasswordPolicyValidator(
        makeCollector({ length: { min: 8, max: 20 } }),
      );
      const errors = validate('short');
      expect(errors).toHaveLength(1);
      assert(Array.isArray(errors));
      expect(errors[0]).toContain('8');
      expect(errors[0]).toContain('20');
    });

    it('should fail when value is longer than length.max', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ length: { min: 1, max: 4 } }));
      expect(validate('toolong')).toHaveLength(1);
    });

    it('should check only the lower bound when length.max is undefined', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ length: { min: 8 } }));
      expect(validate('short')).toHaveLength(1);
      expect(validate('longenough')).toEqual([]);
    });

    it('should check only the upper bound when length.min is undefined', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ length: { max: 4 } }));
      expect(validate('toolong')).toHaveLength(1);
      expect(validate('ok')).toEqual([]);
    });

    it('should skip the length check entirely when both min and max are undefined', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ length: {} }));
      expect(validate('')).toEqual([]);
      expect(validate('anything-at-all')).toEqual([]);
    });
  });

  describe('minUniqueCharacters rule', () => {
    it('should fail when the count of distinct characters is below the minimum', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ minUniqueCharacters: 5 }));
      const errors = validate('aaa111@@@');
      assert(Array.isArray(errors));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('5');
    });

    it('should pass when the count of distinct characters meets the minimum', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ minUniqueCharacters: 3 }));
      expect(validate('abc')).toEqual([]);
    });
  });

  describe('maxRepeatedCharacters rule', () => {
    it('should fail based on total occurrences of any character, not only consecutive runs', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ maxRepeatedCharacters: 2 }));
      const errors = validate('aXaXaX');
      assert(Array.isArray(errors));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('2');
    });

    it('should pass when no character appears more than the maximum', () => {
      const validate = returnPasswordPolicyValidator(makeCollector({ maxRepeatedCharacters: 2 }));
      expect(validate('abcabc')).toEqual([]);
    });
  });

  describe('minCharacters rule', () => {
    it('should fail when the value contains fewer characters from the required charset than required', () => {
      const validate = returnPasswordPolicyValidator(
        makeCollector({ minCharacters: { '0123456789': 2 } }),
      );
      const errors = validate('Password@1');
      expect(errors).toHaveLength(1);
      assert(Array.isArray(errors));
      expect(errors[0]).toContain('2');
      expect(errors[0]).toContain('0123456789');
    });

    it('should pass when enough characters from the required charset are present', () => {
      const validate = returnPasswordPolicyValidator(
        makeCollector({ minCharacters: { '!@#$%^&*()': 2 } }),
      );
      expect(validate('hello@world!')).toEqual([]);
    });

    it('should emit one error per failing charset when multiple are required', () => {
      const validate = returnPasswordPolicyValidator(
        makeCollector({
          minCharacters: {
            '0123456789': 1,
            ABCDEFGHIJKLMNOPQRSTUVWXYZ: 1,
          },
        }),
      );
      const errors = validate('lowercaseonly');
      expect(errors).toHaveLength(2);
    });
  });

  it('should accumulate errors from multiple failing rules', () => {
    const validate = returnPasswordPolicyValidator(
      makeCollector({
        length: { min: 12, max: 20 },
        minUniqueCharacters: 10,
        minCharacters: { '0123456789': 1 },
      }),
    );
    const result = validate('aaa');
    assert(Array.isArray(result));
    expect(result.length).toBeGreaterThanOrEqual(3);
  });
});

describe('returnValidatedBooleanCollector', () => {
  it('should include appearance on output', () => {
    const field: SingleCheckboxField = {
      type: 'SINGLE_CHECKBOX',
      inputType: 'BOOLEAN',
      key: 'accept-terms',
      label: 'Accept Terms',
      required: false,
      appearance: 'checkbox',
    };
    const result = returnValidatedBooleanCollector(field, 0);
    expect(result.output.appearance).toBe('checkbox');
  });

  it('should include richContent on output when field has richContent', () => {
    const field: SingleCheckboxField = {
      type: 'SINGLE_CHECKBOX',
      inputType: 'BOOLEAN',
      key: 'accept-terms',
      label: 'Accept Terms',
      required: false,
      appearance: 'checkbox',
      richContent: {
        content: 'I agree to the {{link}}',
        replacements: {
          link: {
            type: 'link',
            value: 'terms and conditions',
            href: 'https://example.com/terms',
            target: '_blank',
          },
        },
      },
    };
    const result = returnValidatedBooleanCollector(field, 0);
    expect(result.output.richContent).toEqual({
      content: 'I agree to the {{link}}',
      replacements: [
        {
          key: 'link',
          type: 'link',
          value: 'terms and conditions',
          href: 'https://example.com/terms',
          target: '_blank',
        },
      ],
    });
  });
});

describe('returnBooleanCollector', () => {
  it('should produce a BooleanCollector with SingleValueCollector category', () => {
    const field: SingleCheckboxField = {
      type: 'SINGLE_CHECKBOX',
      inputType: 'BOOLEAN',
      key: 'newsletter',
      label: 'Subscribe to newsletter',
      required: false,
      appearance: 'checkbox',
    };
    const result = returnBooleanCollector(field, 0);
    expect(result satisfies BooleanCollector).toEqual({
      category: 'SingleValueCollector',
      type: 'BooleanCollector',
      error: null,
      id: 'newsletter-0',
      name: 'newsletter',
      input: {
        key: 'newsletter',
        value: false,
        type: 'SINGLE_CHECKBOX',
      },
      output: {
        key: 'newsletter',
        label: 'Subscribe to newsletter',
        type: 'SINGLE_CHECKBOX',
        value: false,
        appearance: 'checkbox',
      },
    });
  });

  it('should include richContent on output when field has richContent', () => {
    const field: SingleCheckboxField = {
      type: 'SINGLE_CHECKBOX',
      inputType: 'BOOLEAN',
      key: 'accept-terms',
      label: 'Accept Terms',
      required: false,
      appearance: 'checkbox',
      richContent: {
        content: 'I agree to the {{link}}',
        replacements: {
          link: {
            type: 'link',
            value: 'terms and conditions',
            href: 'https://example.com/terms',
            target: '_blank',
          },
        },
      },
    };
    const result = returnBooleanCollector(field, 0);
    expect(result.output.richContent).toEqual({
      content: 'I agree to the {{link}}',
      replacements: [
        {
          key: 'link',
          type: 'link',
          value: 'terms and conditions',
          href: 'https://example.com/terms',
          target: '_blank',
        },
      ],
    });
  });

  it('should omit richContent from output when field has no richContent', () => {
    const field: SingleCheckboxField = {
      type: 'SINGLE_CHECKBOX',
      inputType: 'BOOLEAN',
      key: 'accept-terms',
      label: 'Accept Terms',
      required: false,
      appearance: 'checkbox',
    };
    const result = returnBooleanCollector(field, 0);
    expect(result.output).not.toHaveProperty('richContent');
  });
});
