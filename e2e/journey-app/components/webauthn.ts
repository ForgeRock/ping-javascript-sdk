/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { JourneyStep } from '@forgerock/journey-client/types';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';

export function extractRegistrationCredentialId(outcomeValue: string): string | null {
  // This app consumes the hidden `webAuthnOutcome` callback populated by journey-client.
  // See packages/journey-client/src/lib/webauthn/webauthn.ts:
  // - register(): JSON-wrapped outcome when `supportsJsonResponse` is enabled
  // - register(): plain legacy outcome string otherwise
  let legacyData: string | null = outcomeValue;

  // Newer journey-client responses may wrap the legacy string as:
  // { authenticatorAttachment, legacyData }
  // We only need the legacy payload here; the attachment is not used by journey-app.
  try {
    const parsed = JSON.parse(outcomeValue) as unknown;
    if (parsed && typeof parsed === 'object' && 'legacyData' in parsed) {
      const candidate = (parsed as Record<string, unknown>).legacyData;
      legacyData = typeof candidate === 'string' ? candidate : null;
    }
  } catch {
    // Not JSON; fall back to plain legacy outcome string.
  }

  if (!legacyData) {
    return null;
  }

  // journey-client registration outcome format is:
  // clientDataJSON::attestationObject::credentialId[::deviceName]
  // The app only needs the third segment so delete-webauthn-devices can target
  // the same registered credential later.
  // See e2e/journey-app/main.ts and e2e/journey-app/services/delete-webauthn-devices.ts.
  const parts = legacyData.split('::');
  const credentialId = parts[2];
  return credentialId && credentialId.length > 0 ? credentialId : null;
}

export type WebAuthnHandleResult = {
  success: boolean;
  credentialId: string | null;
};

export function webauthnComponent(journeyEl: HTMLDivElement, step: JourneyStep, idx: number) {
  const container = document.createElement('div');
  container.id = `webauthn-container-${idx}`;
  const info = document.createElement('p');
  info.innerText = 'Please complete the WebAuthn challenge using your authenticator.';
  container.appendChild(info);
  journeyEl.appendChild(container);

  const webAuthnStepType = WebAuthn.getWebAuthnStepType(step);

  async function handleWebAuthn(): Promise<WebAuthnHandleResult> {
    try {
      if (webAuthnStepType === WebAuthnStepType.Authentication) {
        console.log('trying authentication');
        await WebAuthn.authenticate(step);
        return { success: true, credentialId: null };
      }

      if (webAuthnStepType === WebAuthnStepType.Registration) {
        console.log('trying registration');
        await WebAuthn.register(step);

        const { hiddenCallback } = WebAuthn.getCallbacks(step);
        const rawOutcome = String(hiddenCallback?.getInputValue() ?? '');
        const credentialId = extractRegistrationCredentialId(rawOutcome);
        console.log('[WebAuthn] registration credentialId:', credentialId);
        return { success: true, credentialId };
      }

      return { success: false, credentialId: null };
    } catch {
      return { success: false, credentialId: null };
    }
  }

  return handleWebAuthn();
}
