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
  returnSingleValueAutoCollector,
  returnObjectValueAutoCollector,
  returnQrCodeCollector,
  returnAgreementCollector,
  normalizeReplacements,
} from './collector.utils.js';
import type {
  DaVinciField,
  DeviceAuthenticationField,
  DeviceRegistrationField,
  FidoAuthenticationField,
  FidoRegistrationField,
  PhoneNumberField,
  ProtectField,
  QrCodeField,
  PollingField,
  ReadOnlyField,
  RedirectField,
  RichContentReplacement,
  StandardField,
  AgreementField,
} from './davinci.types.js';
import type {
  MultiSelectCollector,
  PhoneNumberCollector,
  PhoneNumberOutputValue,
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

describe('returnPhoneNumberCollector', () => {
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
    it('should return a ReadOnlyCollector with plain content and empty richContent when no richContent on field', () => {
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
          richContent: {
            content: mockField.content,
            replacements: [],
          },
        },
      });
    });

    it('should pass through richContent template and validated replacements', () => {
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
        type: 'ReadOnlyCollector',
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

      const result = returnReadOnlyCollector(field, 0);

      expect(result.error).toBeNull();
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

describe('returnAgreementCollector', () => {
  it('should return a valid AgreementCollector with all fields', () => {
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
    const result = returnAgreementCollector(mockField, 0);
    expect(result).toEqual({
      category: 'NoValueCollector',
      error: null,
      type: 'AgreementCollector',
      id: 'agreement-field-0',
      name: 'agreement-field-0',
      output: {
        key: 'agreement-field-0',
        label: 'Please accept the terms and conditions',
        type: 'AGREEMENT',
        titleEnabled: true,
        title: 'Terms and Conditions',
        agreement: {
          id: 'agreement-123',
          useDynamicAgreement: false,
        },
        enabled: true,
      },
    });
  });

  it('should set error when content is missing', () => {
    const mockField = { type: 'AGREEMENT', key: 'agreement-field' } as unknown as AgreementField;
    const result = returnAgreementCollector(mockField, 0);
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

    const labelCollector = returnReadOnlyCollector(labelField, 0);
    const checkboxCollector = returnMultiSelectCollector(checkboxField, 1, []);

    // Verify label collector has pass-through richContent
    expect(labelCollector.type).toBe('ReadOnlyCollector');
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
