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

  async function handleWebAuthn() {
    try {
      if (webAuthnStepType === WebAuthnStepType.Authentication) {
        console.log('trying authentication');
        await WebAuthn.authenticate(step);
        console.log('trying registration');
      } else if (WebAuthnStepType.Registration === webAuthnStepType) {
        await WebAuthn.register(step);
      } else {
        return Promise.resolve(undefined);
      }
    } catch (error) {
      console.error('WebAuthn error:', error);
    }
  }

  return handleWebAuthn();
}
