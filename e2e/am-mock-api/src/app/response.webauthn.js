/*
 * @forgerock/javascript-sdk
 *
 * response.webauthn.js
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * WebAuthn registration initialization response
 * Contains MetadataCallback for WebAuthn and HiddenValueCallback for credential
 */
export const webAuthnRegistrationInit = {
  authId: 'webauthn-registration-init',
  callbacks: [
    {
      type: 'MetadataCallback',
      output: [
        {
          name: 'data',
          value: {
            _type: 'WebAuthn',
            _action: 'webauthn_registration',
            challenge: 'dGVzdC1jaGFsbGVuZ2UtZm9yLXdlYmF1dGhu',
            relyingPartyId: 'localhost',
            relyingPartyName: 'ForgeRock',
            userId: 'dGVzdC11c2VyLWlk',
            userName: 'testuser',
            displayName: 'Test User',
            timeout: 60000,
            attestationPreference: 'none',
            authenticatorAttachment: 'platform',
            requireResidentKey: false,
            userVerification: 'preferred',
            pubKeyCredParams: [
              { type: 'public-key', alg: -7 },
              { type: 'public-key', alg: -257 },
            ],
          },
        },
      ],
    },
    {
      type: 'HiddenValueCallback',
      output: [
        {
          name: 'value',
          value: '',
        },
        {
          name: 'id',
          value: 'webAuthnOutcome',
        },
      ],
      input: [
        {
          name: 'IDToken2',
          value: '',
        },
      ],
    },
  ],
};

/**
 * Returns the recovery codes display response
 * This simulates the step after WebAuthn registration where recovery codes are shown
 */
export function getRecoveryCodesDisplay() {
  const recoveryCodes = [
    'ABC123DEF4',
    'GHI567JKL8',
    'MNO901PQR2',
    'STU345VWX6',
    'YZA789BCD0',
    'EFG123HIJ4',
    'KLM567NOP8',
    'QRS901TUV2',
    'WXY345ZAB6',
    'CDE789FGH0',
  ];

  // Build the recovery codes HTML similar to what AM generates
  const codesHtml = recoveryCodes
    .map((code) => `"<div class=\\"text-center\\">\\n" +\n    "${code}\\n" +\n    "</div>\\n" +`)
    .join('\n    ');

  const scriptValue = `/*
 * Copyright 2018 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

var newLocation = document.getElementById("wrapper");
var oldHtml = newLocation.getElementsByTagName("fieldset")[0].innerHTML;
newLocation.getElementsByTagName("fieldset")[0].innerHTML = "<div class=\\"panel panel-default\\">\\n" +
    "    <div class=\\"panel-body text-center\\">\\n" +
    "        <h3>Your Recovery Codes</h3>\\n" +
    "        <h4>You must make a copy of these recovery codes. They cannot be displayed again.</h4>\\n" +
    "    </div>\\n" +
    ${codesHtml}
    "<div class=\\"panel-body text-center\\">\\n" +
    "        <p>Use one of these codes to authenticate if you lose your device, which has been named: <em>New Security Key</em></p>\\n" +
    "</div>\\n" +
    "</div>" + oldHtml;
document.body.appendChild(newLocation);
`;

  return {
    authId: 'recovery-codes-display',
    callbacks: [
      {
        type: 'TextOutputCallback',
        output: [
          {
            name: 'message',
            value: scriptValue,
          },
          {
            name: 'messageType',
            value: '4',
          },
        ],
      },
      {
        type: 'ConfirmationCallback',
        output: [
          {
            name: 'prompt',
            value: '',
          },
          {
            name: 'messageType',
            value: 0,
          },
          {
            name: 'options',
            value: ['I have saved my recovery codes'],
          },
          {
            name: 'optionType',
            value: -1,
          },
          {
            name: 'defaultOption',
            value: 0,
          },
        ],
        input: [
          {
            name: 'IDToken2',
            value: 0,
          },
        ],
      },
    ],
  };
}

/**
 * Auth success response for WebAuthn flow
 */
export const authSuccess = {
  tokenId: 'webauthn-session-token',
  successUrl: '/console',
  realm: '/',
};
