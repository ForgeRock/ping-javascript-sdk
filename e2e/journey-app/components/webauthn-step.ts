/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { BaseCallback, JourneyStep } from '@forgerock/journey-client/types';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';

import { renderCallbacks } from '../callback-map.js';

type WebAuthnStepHandlerResult = {
  callbacksRendered: boolean;
  didSubmit: boolean;
};

export function webauthnComponent(journeyEl: HTMLDivElement, step: JourneyStep, idx: number) {
  const container = document.createElement('div');
  container.id = `webauthn-container-${idx}`;
  const info = document.createElement('p');
  info.innerText = 'Please complete the WebAuthn challenge using your authenticator.';
  container.appendChild(info);
  journeyEl.appendChild(container);

  const webAuthnStepType = WebAuthn.getWebAuthnStepType(step);

  async function handleWebAuthn(): Promise<boolean> {
    try {
      if (webAuthnStepType === WebAuthnStepType.Authentication) {
        console.log('trying authentication');
        await WebAuthn.authenticate(step);
        return true;
      }

      if (webAuthnStepType === WebAuthnStepType.Registration) {
        console.log('trying registration');
        await WebAuthn.register(step);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return handleWebAuthn();
}

export async function handleWebAuthnStep(
  journeyEl: HTMLDivElement,
  step: JourneyStep,
  callbacks: BaseCallback[],
  submitForm: () => void,
  setError: (message: string) => void,
): Promise<WebAuthnStepHandlerResult> {
  const webAuthnStep = WebAuthn.getWebAuthnStepType(step);

  if (webAuthnStep === WebAuthnStepType.Authentication) {
    // For conditional mediation, we need an input with `autocomplete="webauthn"` to exist.
    renderCallbacks(journeyEl, callbacks, submitForm);

    const conditionalInput = journeyEl.querySelector(
      'input[autocomplete="webauthn"]',
    ) as HTMLInputElement | null;
    conditionalInput?.focus();

    const isConditionalSupported = await WebAuthn.isConditionalMediationSupported();
    if (isConditionalSupported && conditionalInput) {
      const controller = new AbortController();
      void WebAuthn.authenticate(step, 'conditional', controller.signal)
        .then(() => submitForm())
        .catch(() => {
          setError('WebAuthn failed or was cancelled. Please try again or use a different method.');
        });

      return { callbacksRendered: true, didSubmit: false };
    }

    // Fallback to the traditional (prompted) WebAuthn flow.
    const webAuthnSuccess = await webauthnComponent(journeyEl, step, 0);
    if (webAuthnSuccess) {
      submitForm();
      return { callbacksRendered: true, didSubmit: true };
    }

    setError('WebAuthn failed or was cancelled. Please try again or use a different method.');
    return { callbacksRendered: true, didSubmit: false };
  }

  if (webAuthnStep === WebAuthnStepType.Registration) {
    // For registration, we keep the traditional (prompted) WebAuthn flow.
    const webAuthnSuccess = await webauthnComponent(journeyEl, step, 0);
    if (webAuthnSuccess) {
      submitForm();
      return { callbacksRendered: false, didSubmit: true };
    }

    setError('WebAuthn failed or was cancelled. Please try again or use a different method.');
    return { callbacksRendered: false, didSubmit: false };
  }

  return { callbacksRendered: false, didSubmit: false };
}
