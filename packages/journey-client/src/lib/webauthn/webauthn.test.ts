/*
 * @forgerock/ping-javascript-sdk
 *
 * fr-webauthn.test.ts
 *
 * Copyright (c) 2020 - 2026 Ping Identity Corporation. All rights reserved.
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
import { vi, afterEach, beforeEach, expect } from 'vitest';

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

describe('WebAuthn conditional mediation', () => {
  const originalNavigatorCredentials = navigator.credentials;
  const originalPublicKeyCredential = globalThis.PublicKeyCredential;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'PublicKeyCredential', {
      configurable: true,
      writable: true,
      value: class PublicKeyCredential {
        static async isConditionalMediationAvailable(): Promise<boolean> {
          return true;
        }
      },
    });

    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: {
        get: vi.fn(),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: originalNavigatorCredentials,
    });

    Object.defineProperty(globalThis, 'PublicKeyCredential', {
      configurable: true,
      writable: true,
      value: originalPublicKeyCredential,
    });

    vi.restoreAllMocks();
  });

  it('requires an AbortSignal when mediation is conditional', async () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthMetaCallback70 as any);
    const hiddenCallback = WebAuthn.getOutcomeCallback(step);
    if (!hiddenCallback) throw new Error('Missing hidden callback for test');

    await expect(WebAuthn.authenticate(step, 'conditional')).rejects.toThrow(
      'AbortSignal is required for conditional mediation WebAuthn requests',
    );

    expect(hiddenCallback.getInputValue()).toContain(
      'AbortSignal is required for conditional mediation WebAuthn requests',
    );
  });

  it('throws NotSupportedError when conditional mediation is not supported by the browser', async () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthMetaCallback70 as any);
    const hiddenCallback = WebAuthn.getOutcomeCallback(step);
    if (!hiddenCallback) throw new Error('Missing hidden callback for test');

    const conditionalSupportSpy = vi
      .spyOn(WebAuthn, 'isConditionalMediationSupported')
      .mockResolvedValue(false);

    await expect(
      WebAuthn.authenticate(step, 'conditional', new AbortController().signal),
    ).rejects.toMatchObject({ name: 'NotSupportedError' });

    expect(conditionalSupportSpy).toHaveBeenCalledTimes(1);
    expect(hiddenCallback.getInputValue()).toBe('unsupported');
    expect(navigator.credentials.get as unknown as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
  });

  it('passes mediation + signal through to navigator.credentials.get when supported', async () => {
    // eslint-disable-next-line
    const step = createJourneyStep(webAuthnAuthMetaCallback70 as any);
    const hiddenCallback = WebAuthn.getOutcomeCallback(step);
    if (!hiddenCallback) throw new Error('Missing hidden callback for test');

    const abortController = new AbortController();
    const credentialsGet = vi
      .spyOn(navigator.credentials, 'get')
      .mockResolvedValue({} as unknown as Credential);

    const outcomeSpy = vi
      .spyOn(WebAuthn, 'getAuthenticationOutcome')
      .mockReturnValue('ok' as unknown as ReturnType<typeof WebAuthn.getAuthenticationOutcome>);

    await WebAuthn.authenticate(step, 'conditional', abortController.signal);

    expect(outcomeSpy).toHaveBeenCalledTimes(1);
    expect(credentialsGet).toHaveBeenCalledWith(
      expect.objectContaining({
        mediation: 'conditional',
        signal: abortController.signal,
        publicKey: expect.any(Object),
      }),
    );
    expect(hiddenCallback.getInputValue()).toBe('ok');
  });
});
