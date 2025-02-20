import { describe, it, expect } from 'vitest';
import {
  returnActionCollector,
  returnFlowCollector,
  returnSocialLoginCollector,
  returnSubmitCollector,
  returnSingleValueCollector,
  returnPasswordCollector,
  returnTextCollector,
  returnSingleSelectCollector,
  returnMultiSelectCollector,
} from './collector.utils.js';
import type { DaVinciField, StandardFieldValue } from './davinci.types.js';

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
      const invalidField = {} as StandardFieldValue;
      const result = returnFlowCollector(invalidField, 1);
      expect(result.error).toContain('Key is not found');
      expect(result.error).toContain('Label is not found');
      expect(result.error).toContain('Type is not found');
    });
  });

  describe('returnSocialLoginCollector', () => {
    const mockSocialField: DaVinciField = {
      key: 'google-login',
      label: 'Continue with Google',
      type: 'BUTTON',
      links: {
        authenticate: {
          href: 'https://auth.example.com/google',
        },
      },
    };

    it('should create a valid social login collector with authentication URL', () => {
      const result = returnSocialLoginCollector(mockSocialField, 1);
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'SocialLoginCollector',
        id: 'google-login-1',
        name: 'google-login',
        output: {
          key: mockSocialField.key,
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
      const result = returnSocialLoginCollector(fieldWithoutUrl, 1);
      if ('url' in result.output) {
        expect(result.output.url).toBeNull();
      }
    });

    it('should handle error cases properly', () => {
      const invalidField = {} as StandardFieldValue;
      const result = returnSocialLoginCollector(invalidField, 1);
      expect(result.error).toContain('Key is not found');
      expect(result.type).toBe('SocialLoginCollector');
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
      const invalidField = {} as StandardFieldValue;
      const result = returnSubmitCollector(invalidField, 1);
      expect(result.error).toContain('Key is not found');
      expect(result.type).toBe('SubmitCollector');
    });
  });

  const mockField: StandardFieldValue = {
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

  describe('returnActionCollector', () => {
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
      const result = returnActionCollector(socialLoginField, 1, 'SocialLoginCollector');
      expect(result).toEqual({
        category: 'ActionCollector',
        error: null,
        type: 'SocialLoginCollector',
        id: 'google-login-1',
        name: 'google-login',
        output: {
          key: 'google-login',
          label: 'Login with Google',
          type: 'SOCIAL_LOGIN_BUTTON',
          url: 'https://auth.example.com/google',
        },
      });
    });

    it('handles missing authentication URL for social login', () => {
      const result = returnActionCollector(mockField, 1, 'SocialLoginCollector');
      if ('url' in result.output) {
        expect(result.output.url).toBeNull();
      }
    });

    it('should return an error message when field is missing key, label, or type', () => {
      const field = {};
      const idx = 3;
      const result = returnActionCollector(field as StandardFieldValue, idx, 'ActionCollector');
      expect(result.error).toBe(
        'Key is not found in the field object. Label is not found in the field object. Type is not found in the field object. ',
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
        field as StandardFieldValue,
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

    it('creates an action collector from flow link field type', () => {
      const result = returnFlowCollector(mockField, 1);
      expect(result.type).toBe('FlowCollector');
      expect(result.output).not.toHaveProperty('value');
    });
  });
});
