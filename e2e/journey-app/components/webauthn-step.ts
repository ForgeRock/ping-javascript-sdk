/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { JourneyStep } from '@forgerock/journey-client/types';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';

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
