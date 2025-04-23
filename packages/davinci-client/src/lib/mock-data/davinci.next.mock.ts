/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export const next0 = {
  interactionId: '17f7bb13-1b03-4203-acb4-ccd4afaec908',
  interactionToken:
    '222f461a945b158b3ad63d75d24d3d1a6122938c600d6681bb33fc4b07abf59c69d65e2c1aadf00958df463aaf2ac483b63250d301a6ea92f07423ab39bbde8fb9ba5bc2e4dfbc9e3d03525a4ba954a119f11de0d614b090e7a5798fb3330194af6d967c1456d2c9429d8c72dee86f4ba5fd5bafc954df0d53b54a7ceb8ef404',
  _links: {
    next: {
      href: 'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/867ed4363b2bc21c860085ad2baa817d/capabilities/customHTMLTemplate',
    },
  },
  eventName: 'continue',
  isResponseCompatibleWithMobileAndWebSdks: true,
  id: 'cq77vwelou',
  companyId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  flowId: '6e9114ac34cfcec300202eae7776f981',
  connectionId: '867ed4363b2bc21c860085ad2baa817d',
  capabilityName: 'customHTMLTemplate',
  formData: {
    value: {
      username: '',
      password: '',
    },
  },
  form: {
    name: 'Username/Password Form',
    description: '',
    category: 'CUSTOM_HTML',
    components: {
      fields: [
        {
          type: 'TEXT',
          key: 'username',
          label: 'Username',
        },
        {
          type: 'PASSWORD',
          key: 'password',
          label: 'Password',
        },
        {
          type: 'SUBMIT_BUTTON',
          label: 'Sign On',
          key: 'SIGNON',
        },
        {
          type: 'SUBMIT_BUTTON',
          label: 'Having trouble signing on?',
          key: 'TROUBLE',
        },
        {
          type: 'SUBMIT_BUTTON',
          label: 'No account? Register now!',
          key: 'REGISTER',
        },
      ],
    },
  },
};

// Reset Password
export const next1 = {
  interactionId: '17cefa9c-81f9-48a8-8a48-88a657b28f1a',
  interactionToken:
    '2fa40a9898043c9bd75bafeae64e8f9341b22648a434dc4055c59e6455ab7bd002c0afce26b9f73a5881fe4264f5d95e9daa4aa2948f4d348734f4f9c7cb6e3a4ac1c5d31d892a7564f19aba6e6e54738ae097c6070de71c213d0ffb1e48209d5e091ea09106c861e474513c725c0834fb6ea8f9016d4a9d32d729404c423256',
  _links: {
    next: {
      href: 'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/867ed4363b2bc21c860085ad2baa817d/capabilities/customHTMLTemplate',
    },
  },
  eventName: 'continue',
  isResponseCompatibleWithMobileAndWebSdks: true,
  id: 'h9q1e6iiu0',
  companyId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  flowId: '6e9114ac34cfcec300202eae7776f981',
  connectionId: '867ed4363b2bc21c860085ad2baa817d',
  capabilityName: 'customHTMLTemplate',
  formData: {
    value: {},
  },
  form: {
    name: 'Display password reset form',
    description: 'User can enter a new password to use',
    category: 'CUSTOM_HTML',
    components: {
      fields: [
        {
          type: 'PASSWORD',
          key: 'currentPassword',
          label: 'Current Password',
        },
        {
          type: 'PASSWORD',
          key: 'newPassword',
          label: 'New Password',
        },
        {
          type: 'SUBMIT_BUTTON',
          label: 'Submit',
          key: 'SUBMIT',
        },
      ],
    },
  },
};

// Success Resetting Password
export const next2 = {
  interactionId: '17cefa9c-81f9-48a8-8a48-88a657b28f1a',
  interactionToken:
    '2fa40a9898043c9bd75bafeae64e8f9341b22648a434dc4055c59e6455ab7bd002c0afce26b9f73a5881fe4264f5d95e9daa4aa2948f4d348734f4f9c7cb6e3a4ac1c5d31d892a7564f19aba6e6e54738ae097c6070de71c213d0ffb1e48209d5e091ea09106c861e474513c725c0834fb6ea8f9016d4a9d32d729404c423256',
  _links: {
    next: {
      href: 'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/867ed4363b2bc21c860085ad2baa817d/capabilities/customHTMLTemplate',
    },
  },
  eventName: 'continue',
  isResponseCompatibleWithMobileAndWebSdks: true,
  id: '5bte6h5ivc',
  companyId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  flowId: '6e9114ac34cfcec300202eae7776f981',
  connectionId: '867ed4363b2bc21c860085ad2baa817d',
  capabilityName: 'customHTMLTemplate',
  formData: {
    value: {},
  },
  form: {
    name: 'Reset password success',
    description: 'Displays a success page for update password',
    category: 'CUSTOM_HTML',
    components: {
      fields: [
        {
          type: 'SUBMIT_BUTTON',
          label: 'Continue',
          key: 'CONTINUE',
        },
      ],
    },
  },
};

export const next3 = {
  interactionId: '18063aab-5720-48de-a346-cbcc87fdaaf2',
  interactionToken:
    '59a7722ccd10ec7bd97dcc713837db11fa7fefea736ad0a4fb44f72b81eecc8a9fff462c73008f0eb89b73f5cc723d24490214773f9a5ef4d01f94a2259b25ddcc2f71347cbe5291db21f42ee2261930aa1df9829588a234bf7b84aeb63a045e9fc22ff6610044ad8d8a02f2d9f773e59d95027697678b8e40b9c54f5346c3e9',
  _links: {
    next: {
      href: 'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/867ed4363b2bc21c860085ad2baa817d/capabilities/customHTMLTemplate',
    },
  },
  eventName: 'continue',
  isResponseCompatibleWithMobileAndWebSdks: true,
  id: '5bte6h5ivc',
  companyId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
  flowId: '6e9114ac34cfcec300202eae7776f981',
  connectionId: '867ed4363b2bc21c860085ad2baa817d',
  capabilityName: 'customHTMLTemplate',
  formData: {
    value: {},
  },
  form: {
    name: 'Reset password success',
    description: 'Displays a success page for update password',
    category: 'CUSTOM_HTML',
    components: {
      fields: [
        {
          type: 'SUBMIT_BUTTON',
          label: 'Continue',
          key: 'CONTINUE',
        },
      ],
    },
  },
};

export const next4 = {
  interactionId: '03534806-abbc-4f43-a9b1-8bdba1a57765',
  companyId: '490b9f38-f20b-4afa-b02e-3cc1315e29ab',
  connectionId: '8209285e0d2f3fc76bfd23fd10d45e6f',
  connectorId: 'api',
  id: 'elvr5pbwzn',
  capabilityName: 'customForm',
  enablePolling: false,
  pollInterval: '2000',
  pollRetries: '60',
  pollChallengeStatus: true,
  form: {
    components: {
      fields: [
        {
          type: 'ERROR_DISPLAY',
        },
        {
          type: 'LABEL',
          content:
            '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis.</p>',
        },
        {
          type: 'TEXT',
          key: 'user.username',
          label: 'Enter your Email Address',
          required: true,
        },
        {
          type: 'PASSWORD',
          key: 'user.password',
          label: 'Enter your Password',
          required: true,
        },
        {
          type: 'SUBMIT_BUTTON',
          label: 'Sign On',
          key: 'submit',
        },
      ],
    },
    name: 'SDK - Sign On',
    description: 'This is an out-of-the-box sign on form that prompts for username and password.',
    category: 'CUSTOM_FORM',
  },
  enableMagicLinkAuthentication: true,
  nodeTitle: 'Sign On',
  nodeDescription: 'P1 Form - SignOn',
  envId: '490b9f38-f20b-4afa-b02e-3cc1315e29ab',
  formId: 'cc713951-1ff3-4c77-8b33-cf91690f0c07',
  isResponseCompatibleWithMobileAndWebSdks: true,
  _links: {
    next: {
      href: 'https://auth.pingone.com/490b9f38-f20b-4afa-b02e-3cc1315e29ab/davinci/connections/8209285e0d2f3fc76bfd23fd10d45e6f/capabilities/customForm',
    },
    self: {
      href: 'https://auth.pingone.com/490b9f38-f20b-4afa-b02e-3cc1315e29ab/davinci/policy/c233870943cbaa6ff1a021622d074842/start',
    },
  },
  interactionToken:
    '460b6e374ff40f453eb83e3cf3da33d289538371e293df51afde06dab7ae37963234bb7bac201160b53857e49bdf245367c719ad087efc6d95fa09df4ad3d1bb94b75e1c49d72bd948eddf3a8aff9ebcb4d7a8212741d8d41abb010dd75d26e4d246ef0cea0e2550dc6fbbe36a4492105b28c33f39325291a596cd1ad77cbf95',
  success: true,
  startUiSubFlow: true,
};
