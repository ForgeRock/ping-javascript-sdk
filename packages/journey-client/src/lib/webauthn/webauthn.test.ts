/*
 * @forgerock/ping-javascript-sdk
 *
 * fr-webauthn.test.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

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
} from './webauthn.mock.data.js';
import { createJourneyStep } from '../step.utils.js';

describe('Test FRWebAuthn class with 6.5.3 "Passwordless"', () => {
  it('should return Registration type with register text-output callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnRegJSCallback653 as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate text-output callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthJSCallback653 as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
});

describe('Test FRWebAuthn class with 7.0 "Passwordless"', () => {
  it('should return Registration type with register text-output callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnRegJSCallback70 as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate text-output callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthJSCallback70 as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    console.log('the step type', stepType, WebAuthnStepType.Authentication);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });

  it('should return Registration type with register metadata callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnRegMetaCallback70 as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate metadata callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthMetaCallback70 as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
});

describe('Test FRWebAuthn class with 7.0 "Usernameless"', () => {
  it('should return Registration type with register text-output callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnRegJSCallback70StoredUsername as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });

  it('should return Authentication type with authenticate text-output callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthJSCallback70StoredUsername as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
  it('should return Registration type with register metadata callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnRegMetaCallback70StoredUsername as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Registration);
  });
  it('should return Authentication type with authenticate metadata callbacks', () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthMetaCallback70StoredUsername as any);
    const stepType = WebAuthn.getWebAuthnStepType(step);
    expect(stepType).toBe(WebAuthnStepType.Authentication);
  });
});
