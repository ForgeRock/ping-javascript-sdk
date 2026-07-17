/**
 * Realistic consumer pattern: journey authentication + WebAuthn + device fingerprinting.
 * Mirrors what a real app would import for a complete login experience.
 */
import { journey } from '@forgerock/journey-client';
import { WebAuthn } from '@forgerock/journey-client/webauthn';
import { Device } from '@forgerock/journey-client/device';

const config = {
  serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
};

// Collect device profile before authentication
const device = new Device();
const profile = await device.getProfile({ location: false, metadata: false });
console.log('device profile collected', profile);

const client = await journey({ config });
let step = await client.start();

while (step.type === 'Step') {
  // Check if this step requires WebAuthn
  const webAuthnType = WebAuthn.getWebAuthnStepType(step);
  if (webAuthnType !== 'None') {
    console.log('webauthn step type', webAuthnType);
  }

  step = await client.next(step);
}

if (step.type === 'LoginSuccess') {
  console.log('authenticated', step.getSessionToken());
} else if (step.type === 'LoginFailure') {
  console.error('authentication failed', step);
}
