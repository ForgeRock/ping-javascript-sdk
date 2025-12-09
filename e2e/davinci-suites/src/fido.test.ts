import { test, expect, CDPSession } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test.use({ browserName: 'chromium' }); // ensure CDP/WebAuthn is available

let cdp: CDPSession | undefined;
let authenticatorId: string | undefined;

test.beforeEach(async ({ context, page }) => {
  cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');

  // A "platform" authenticator (aka internal) with UV+RK enabled is the usual default for passkeys.
  const response = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal', // platform authenticator
      hasResidentKey: true, // allow discoverable credentials (passkeys)
      hasUserVerification: true, // device supports UV
      isUserVerified: true, // simulate successful UV (PIN/biometric)
      automaticPresenceSimulation: true, // auto "touch"/presence
    },
  });
  authenticatorId = response.authenticatorId;
});

test.afterEach(async () => {
  await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
  await cdp.send('WebAuthn.disable');
});

test('Register and authenticate with webauthn device', async ({ page }) => {
  const { navigate } = asyncEvents(page);

  await navigate('https://aj-test.pi.scrd.run:5829/?acr_values=ccff5c09002042bd86104da45cd7102e');
  await expect(page).toHaveURL(
    'https://aj-test.pi.scrd.run:5829/?acr_values=ccff5c09002042bd86104da45cd7102e',
  );
  await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

  await page.getByRole('button', { name: 'USER_LOGIN' }).click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign On' }).click();

  // Register WebAuthn credential
  const { credentials: intialCredentials } = await cdp.send('WebAuthn.getCredentials', {
    authenticatorId,
  });
  await expect(intialCredentials).toHaveLength(0);

  await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
  await page.getByRole('button', { name: 'Biometrics/Security Key' }).click();
  await page.getByRole('button', { name: 'FIDO Register' }).click();

  const { credentials: recordedCredentials } = await cdp.send('WebAuthn.getCredentials', {
    authenticatorId,
  });
  await expect(recordedCredentials).toHaveLength(1);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Verify we're back at home page if successful
  await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

  // Authenticate with the registered WebAuthn credential
  const initialSignCount = recordedCredentials[0].signCount;

  await page.getByRole('button', { name: 'DEVICE_AUTHENTICATION' }).click();
  await page.getByRole('button', { name: 'Biometrics/Security Key' }).last().click();
  await page.getByRole('button', { name: 'FIDO Authenticate' }).click();

  const credentialsAfterAuth = await cdp.send('WebAuthn.getCredentials', {
    authenticatorId,
  });
  await expect(credentialsAfterAuth.credentials).toHaveLength(1);

  // Signature counter should have incremented after successful authentication/assertion
  await expect(credentialsAfterAuth.credentials[0].signCount).toBeGreaterThan(initialSignCount);

  // Verify we're back at home page if successful
  await expect(page.getByText('FIDO2 Test Form')).toBeVisible();
});
