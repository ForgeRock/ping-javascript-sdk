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
    renderCallbacks(journeyEl, callbacks, submitForm);

    const isConditionalSupported = await WebAuthn.isConditionalMediationSupported();

    // Fire WebAuthn without awaiting so handleWebAuthnStep returns and main.ts can render the
    // Submit button (traditional login stays available in every case). The SDK decides silent
    // (conditional mediation) vs. modal popup internally from meta.mediation — the app doesn't.
    const controller = new AbortController();
    void WebAuthn.authenticate(step, controller.signal)
      .then(() => submitForm())
      .catch(() => {
        setError('WebAuthn failed or was cancelled. Please try again or use a different method.');
      });

    // hasPasskeyAutocompleteValues reflects the AM admin's decision to emit username+webauthn
    // autocomplete values on the NameCallback — the signal that this step is a passkey-autofill
    // step. Only then do we decorate the username input and render the passkey button.
    if (isConditionalSupported && WebAuthn.hasPasskeyAutocompleteValues(step)) {
      journeyEl.querySelectorAll('input[type="text"]').forEach((input) => {
        input.setAttribute('autocomplete', 'username webauthn');
      });

      // Render the passkey authentication button if AM has enabled it.
      if (WebAuthn.hasAuthenticationButton(step)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Sign in with a passkey';
        button.addEventListener('click', () => {
          // Cancel the background conditional request and force a modal prompt by overriding
          // mediation to 'optional' — the server requested 'conditional' (silent) mediation.
          controller.abort();
          void WebAuthn.authenticate(step, undefined, 'optional')
            .then(() => submitForm())
            .catch(() => {
              setError(
                'WebAuthn failed or was cancelled. Please try again or use a different method.',
              );
            });
        });
        journeyEl.appendChild(button);
      }
    }

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
