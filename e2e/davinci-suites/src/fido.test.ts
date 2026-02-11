import { test, expect, CDPSession } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

const username = 'JSFidoUser@user.com';
const password = 'FakePassword#123';
let cdp: CDPSession | undefined;
let authenticatorId: string | undefined;

test.use({ browserName: 'chromium' }); // ensure CDP/WebAuthn is available

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

test.describe('FIDO/WebAuthn Tests', () => {
  test('Register and authenticate with webauthn device', async ({ page }) => {
    const { navigate } = asyncEvents(page);

    await navigate(
      '/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_values=98f2c058aae71ec09eb268db6810ff3c',
    );
    await expect(page).toHaveURL(
      'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_values=98f2c058aae71ec09eb268db6810ff3c',
    );
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    // Register WebAuthn credential
    const { credentials: initialCredentials } = await cdp.send('WebAuthn.getCredentials', {
      authenticatorId,
    });
    await expect(initialCredentials).toHaveLength(0);

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

  test('Register and authenticate with usernameless', async ({ page }) => {
    const { navigate } = asyncEvents(page);

    await navigate(
      '/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_values=98f2c058aae71ec09eb268db6810ff3c',
    );
    await expect(page).toHaveURL(
      'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_values=98f2c058aae71ec09eb268db6810ff3c',
    );
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    // Register WebAuthn credential
    const { credentials: initialCredentials } = await cdp.send('WebAuthn.getCredentials', {
      authenticatorId,
    });
    await expect(initialCredentials).toHaveLength(0);

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

    await page.getByRole('button', { name: 'USER_NAMELESS' }).click();
    await expect(page.getByText('FIDO2 Authentication')).toBeVisible();
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
});
