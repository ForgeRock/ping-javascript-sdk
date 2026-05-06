import { journey } from '@forgerock/journey-client';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

let step = await client.start();

while (step.type === 'Step') {
  const stepType = WebAuthn.getWebAuthnStepType(step);
  if (stepType === WebAuthnStepType.Authenticate || stepType === WebAuthnStepType.Register) {
    await WebAuthn.getWebAuthnOutcome(step);
  }
  step = await client.next(step);
}
