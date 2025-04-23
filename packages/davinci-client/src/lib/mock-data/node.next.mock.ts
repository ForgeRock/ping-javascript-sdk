/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export const nodeNext0 = {
  cache: { key: '1234' },
  client: {
    action: 'SIGNON',
    description: '',
    collectors: [
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: { key: 'username', value: '', type: 'TEXT' },
        output: { key: 'username', label: 'Username', type: 'TEXT', value: '' },
      },
      {
        category: 'SingleValueCollector',
        error: null,
        type: 'PasswordCollector',
        id: 'password-1',
        name: 'password',
        input: { key: 'password', value: '', type: 'PASSWORD' },
        output: { key: 'password', label: 'Password', type: 'PASSWORD' },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'SIGNON-2',
        name: 'SIGNON',
        output: {
          key: 'SIGNON',
          label: 'Sign On',
          type: 'SUBMIT_BUTTON',
        },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'TROUBLE-3',
        name: 'TROUBLE',
        output: {
          key: 'TROUBLE',
          label: 'Having trouble signing on?',
          type: 'SUBMIT_BUTTON',
        },
      },
      {
        category: 'ActionCollector',
        error: null,
        type: 'SubmitCollector',
        id: 'REGISTER-4',
        name: 'REGISTER',
        output: {
          key: 'REGISTER',
          label: 'No account? Register now!',
          type: 'SUBMIT_BUTTON',
        },
      },
    ],
    name: 'Username/Password Form',
    status: 'continue',
  },
  error: null,
  server: {
    _links: {
      next: {
        href: 'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/867ed4363b2bc21c860085ad2baa817d/capabilities/customHTMLTemplate',
      },
    },
    id: 'cq77vwelou',
    interactionId: '17f7bb13-1b03-4203-acb4-ccd4afaec908',
    interactionToken:
      '222f461a945b158b3ad63d75d24d3d1a6122938c600d6681bb33fc4b07abf59c69d65e2c1aadf00958df463aaf2ac483b63250d301a6ea92f07423ab39bbde8fb9ba5bc2e4dfbc9e3d03525a4ba954a119f11de0d614b090e7a5798fb3330194af6d967c1456d2c9429d8c72dee86f4ba5fd5bafc954df0d53b54a7ceb8ef404',
    eventName: 'continue',
    status: 'continue',
  },
  status: 'continue',
  httpStatus: 200,
};

export const nodeNext1 = {
  cache: {
    key: '1234',
  },
  client: {
    action: 'submit',
    collectors: [
      {
        category: 'SingleValueCollector',
        error: 'Key is not found in the field object. Label is not found in the field object. ',
        id: 'undefined-0',
        input: {
          key: undefined,
          type: 'ERROR_DISPLAY',
          value: '',
        },
        name: undefined,
        output: {
          key: undefined,
          label: undefined,
          type: 'ERROR_DISPLAY',
          value: '',
        },
        type: 'SingleValueCollector',
      },
      {
        category: 'NoValueCollector',
        error: null,
        id: 'LABEL-1',
        name: 'LABEL-1',
        output: {
          key: 'LABEL-1',
          label:
            '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis.</p>',
          type: 'LABEL',
        },
        type: 'ReadOnlyCollector',
      },
      {
        category: 'ValidatedSingleValueCollector',
        error: null,
        id: 'user.username-2',
        input: {
          key: 'user.username',
          type: 'TEXT',
          validation: [
            {
              message: 'Value cannot be empty',
              rule: true,
              type: 'required',
            },
          ],
          value: '',
        },
        name: 'user.username',
        output: {
          key: 'user.username',
          label: 'Enter your Email Address',
          type: 'TEXT',
          value: '',
        },
        type: 'TextCollector',
      },
      {
        category: 'SingleValueCollector',
        error: null,
        id: 'user.password-3',
        input: {
          key: 'user.password',
          type: 'PASSWORD',
          value: '',
        },
        name: 'user.password',
        output: {
          key: 'user.password',
          label: 'Enter your Password',
          type: 'PASSWORD',
        },
        type: 'PasswordCollector',
      },
      {
        category: 'ActionCollector',
        error: null,
        id: 'submit-4',
        name: 'submit',
        output: {
          key: 'submit',
          label: 'Sign On',
          type: 'SUBMIT_BUTTON',
        },
        type: 'SubmitCollector',
      },
    ],
    description: 'This is an out-of-the-box sign on form that prompts for username and password.',
    name: 'SDK - Sign On',
    status: 'continue',
  },
  error: null,
  httpStatus: 200,
  server: {
    _links: {
      next: {
        href: 'https://auth.pingone.com/490b9f38-f20b-4afa-b02e-3cc1315e29ab/davinci/connections/8209285e0d2f3fc76bfd23fd10d45e6f/capabilities/customForm',
      },
      self: {
        href: 'https://auth.pingone.com/490b9f38-f20b-4afa-b02e-3cc1315e29ab/davinci/policy/c233870943cbaa6ff1a021622d074842/start',
      },
    },
    eventName: 'continue',
    id: 'elvr5pbwzn',
    interactionId: '03534806-abbc-4f43-a9b1-8bdba1a57765',
    interactionToken:
      '460b6e374ff40f453eb83e3cf3da33d289538371e293df51afde06dab7ae37963234bb7bac201160b53857e49bdf245367c719ad087efc6d95fa09df4ad3d1bb94b75e1c49d72bd948eddf3a8aff9ebcb4d7a8212741d8d41abb010dd75d26e4d246ef0cea0e2550dc6fbbe36a4492105b28c33f39325291a596cd1ad77cbf95',
    status: 'continue',
  },
  status: 'continue',
};
