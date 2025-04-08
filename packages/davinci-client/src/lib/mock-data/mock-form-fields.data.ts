/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export const obj = {
  interactionId: '18fa40b7-0eb8-4a5c-803c-d3f3f807ed46',
  companyId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  connectionId: '8209285e0d2f3fc76bfd23fd10d45e6f',
  connectorId: 'pingOneFormsConnector',
  id: '65u7m8cm28',
  capabilityName: 'customForm',
  showContinueButton: false,
  form: {
    components: {
      fields: [
        {
          type: 'LABEL',
          content: 'Sign On',
        },
        {
          type: 'LABEL',
          content: 'Welcome to Ping Identity',
        },
        {
          type: 'ERROR_DISPLAY',
        },
        {
          type: 'TEXT',
          key: 'user.username',
          label: 'Username',
          required: true,
          validation: {
            regex: '^[^@]+@[^@]+\\.[^@]+$',
            errorMessage: 'Must be valid email address',
          },
        },
        {
          type: 'PASSWORD',
          key: 'password',
          label: 'Password',
          required: true,
        },
        {
          type: 'SUBMIT_BUTTON',
          label: 'Sign On',
          key: 'submit',
        },
        {
          type: 'FLOW_LINK',
          key: 'register',
          label: 'No account? Register now!',
        },
        {
          type: 'FLOW_LINK',
          key: 'trouble',
          label: 'Having trouble signing on?',
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
          type: 'CHECKBOX',
          key: 'checkbox-field',
          label: 'Checkbox',
          required: true,
          options: [
            {
              label: 'checkbox1',
              value: 'checkbox1',
            },
            {
              label: 'checkbox2',
              value: 'checkbox2',
            },
          ],
          inputType: 'MULTI_SELECT',
        },
      ],
    },
    name: 'session main - signon1',
    description: 'session main flow - sign on form ',
    category: 'CUSTOM_FORM',
  },
  theme: 'activeTheme',
  formData: {
    value: {
      'user.username': '',
      password: '',
      'dropdown-field': '',
      'combobox-field': '',
      'radio-field': '',
      'checkbox-field': '',
    },
  },
  returnUrl: '',
  enableRisk: false,
  collectBehavioralData: false,
  universalDeviceIdentification: false,
  pingidAgent: false,
  linkWithP1User: true,
  population: 'usePopulationId',
  buttonText: 'Submit',
  authenticationMethodSource: 'useDefaultMfaPolicy',
  nodeTitle: 'Sign On',
  nodeDescription: 'Enter username and password',
  backgroundColor: '#b7e9deff',
  envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  region: 'CA',
  themeId: 'activeTheme',
  formId: 'f0cf83ab-f8f4-4f4a-9260-8f7d27061fa7',
  passwordPolicy: {
    _links: {
      environment: {
        href: 'http://10.76.247.190:4140/directory-api/environments/02fb4743-189a-4bc7-9d6c-a919edfe6447',
      },
      self: {
        href: 'http://10.76.247.190:4140/directory-api/environments/02fb4743-189a-4bc7-9d6c-a919edfe6447/passwordPolicies/39cad7af-3c2f-4672-9c3f-c47e5169e582',
      },
    },
    id: '39cad7af-3c2f-4672-9c3f-c47e5169e582',
    environment: {
      id: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
    },
    name: 'Standard',
    description: 'A standard policy that incorporates industry best practices',
    excludesProfileData: true,
    notSimilarToCurrent: true,
    excludesCommonlyUsed: true,
    maxAgeDays: 182,
    minAgeDays: 1,
    maxRepeatedCharacters: 2,
    minUniqueCharacters: 5,
    history: {
      count: 6,
      retentionDays: 365,
    },
    lockout: {
      failureCount: 5,
      durationSeconds: 900,
    },
    length: {
      min: 8,
      max: 255,
    },
    minCharacters: {
      '~!@#$%^&*()-_=+[]{}|;:,.<>/?': 1,
      '0123456789': 1,
      ABCDEFGHIJKLMNOPQRSTUVWXYZ: 1,
      abcdefghijklmnopqrstuvwxyz: 1,
    },
    populationCount: 1,
    createdAt: '2024-01-03T19:50:39.586Z',
    updatedAt: '2024-01-03T19:50:39.586Z',
    default: true,
  },
  isResponseCompatibleWithMobileAndWebSdks: true,
  fieldTypes: [
    'LABEL',
    'ERROR_DISPLAY',
    'TEXT',
    'PASSWORD',
    'RADIO',
    'CHECKBOX',
    'FLOW_LINK',
    'COMBOBOX',
    'DROPDOWN',
    'SUBMIT_BUTTON',
  ],
  success: true,
  interactionToken:
    '51bfd3ad179f2f76aa01b759fcc11470a2bd4d99a4b45b72ecaba6e3e422c7dde53987bc2887f0fc590ba22ba7ae1216acce7ef4f213e79075dd73383b63c519db25e2d88840efbf4dc9eda93241d26663d9882f3d738bdbdf06702daa89a630d9bed292d76f5deec5cc0c915738d227ccff9ff8062b15a1b25a8dab8b7f7b96',
  startUiSubFlow: true,
  _links: {
    next: {
      href: 'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/8209285e0d2f3fc76bfd23fd10d45e6f/capabilities/customForm',
    },
  },
};
