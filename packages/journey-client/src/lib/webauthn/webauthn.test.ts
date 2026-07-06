/*
 * @forgerock/ping-javascript-sdk
 *
 * fr-webauthn.test.ts
 *
 * Copyright (c) 2020 - 2026 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Step } from '@forgerock/sdk-types';

import { WebAuthnStepType } from './enums.js';
import { WebAuthn } from './webauthn.js';
import {
  webAuthnRegJSCallback653,
  webAuthnAuthJSCallback653,
  webAuthnRegJSCallback70,
  webAuthnAuthJSCallback70,
  webAuthnRegMetaCallback70,
  webAuthnAuthMetaCallback70,
  webAuthnRegJSCallback70StoredUsername,
  webAuthnAuthJSCallback70StoredUsername,
  webAuthnRegMetaCallback70StoredUsername,
  webAuthnAuthMetaCallback70StoredUsername,
  webAuthnAuthMetaCallbackWithPasskeyAutofill,
  webAuthnAuthMetaCallbackWithoutPasskeyAutofill,
} from './webauthn.mock.data.js';
import { createJourneyStep } from '../step.utils.js';

describe('Test FRWebAuthn class with 6.5.3 "Passwordless"', () => {
  it('should return Registration type with register text-output callbacks', () => {
    const step = createJourneyStep(webAuthnRegJSCallback653 as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate text-output callbacks', () => {
    const step = createJourneyStep(webAuthnAuthJSCallback653 as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
});

describe('Test FRWebAuthn class with 7.0 "Passwordless"', () => {
  it('should return Registration type with register text-output callbacks', () => {
    const step = createJourneyStep(webAuthnRegJSCallback70 as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate text-output callbacks', () => {
    const step = createJourneyStep(webAuthnAuthJSCallback70 as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });

  it('should return Registration type with register metadata callbacks', () => {
    const step = createJourneyStep(webAuthnRegMetaCallback70 as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate metadata callbacks', () => {
    const step = createJourneyStep(webAuthnAuthMetaCallback70 as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
});

describe('Test FRWebAuthn class with 7.0 "Usernameless"', () => {
  it('should return Registration type with register text-output callbacks', () => {
    const step = createJourneyStep(webAuthnRegJSCallback70StoredUsername as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate text-output callbacks', () => {
    const step = createJourneyStep(webAuthnAuthJSCallback70StoredUsername as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
  it('should return Registration type with register metadata callbacks', () => {
    const step = createJourneyStep(webAuthnRegMetaCallback70StoredUsername as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });
  it('should return Authentication type with authenticate metadata callbacks', () => {
    const step = createJourneyStep(webAuthnAuthMetaCallback70StoredUsername as Step);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
});

describe('WebAuthn.hasPasskeyAutocompleteValues', () => {
  it('returns true when a NameCallback has both "username" and "webauthn" autocomplete values', () => {
    const step = createJourneyStep(webAuthnAuthMetaCallbackWithPasskeyAutofill as Step);
    expect(WebAuthn.hasPasskeyAutocompleteValues(step)).toBe(true);
  });

  it('returns false when a NameCallback is missing the "webauthn" autocomplete value', () => {
    const step = createJourneyStep(webAuthnAuthMetaCallbackWithoutPasskeyAutofill as Step);
    expect(WebAuthn.hasPasskeyAutocompleteValues(step)).toBe(false);
  });

  it('returns false when there is no NameCallback in the step', () => {
    const step = createJourneyStep(webAuthnAuthMetaCallback70 as Step);
    expect(WebAuthn.hasPasskeyAutocompleteValues(step)).toBe(false);
  });
});
