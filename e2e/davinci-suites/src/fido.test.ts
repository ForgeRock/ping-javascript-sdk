/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { test, expect, CDPSession } from '@forgerock/e2e-shared/coverage-fixture';
import { asyncEvents } from './utils/async-events.js';

const username = 'JSFidoUser@user.com';
const password = 'FakePassword#123';

const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
const policyId = '3eff62cf953372519225d375fd200358';

test.use({ browserName: 'chromium' }); // ensure CDP/WebAuthn is available
test.describe.configure({ mode: 'serial' });

test.describe('FIDO/WebAuthn Success Tests', () => {
  let cdp: CDPSession | undefined;
  let authenticatorId: string | undefined;

  test.beforeEach(async ({ context, page }) => {
    if (authenticatorId) {
      await cdp?.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
      authenticatorId = undefined;
    }

    cdp = await context.newCDPSession(page);
    await expect(cdp).toBeDefined();
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
    if (authenticatorId) {
      await cdp?.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
      authenticatorId = undefined;
    }
    await cdp?.send('WebAuthn.disable');
  });
  test('Register and authenticate with webauthn device', async ({ page }) => {
    const { navigate } = asyncEvents(page);

    await navigate(`/?clientId=${clientId}&acr_values=${policyId}`);
    await expect(page).toHaveURL(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${policyId}`,
    );
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    if (!cdp || !authenticatorId) {
      throw new Error('Missing virtual authenticator');
    }

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

    await navigate(`/?clientId=${clientId}&acr_values=${policyId}`);
    await expect(page).toHaveURL(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${policyId}`,
    );
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await expect(cdp).toBeDefined;
    await expect(authenticatorId).toBeDefined();

    if (!cdp || !authenticatorId) {
      throw new Error('Missing virtual authenticator');
    }

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

test.describe('FIDO/WebAuthn Error Tests', () => {
  let cdp: CDPSession | undefined;
  let authenticatorId: string | undefined;

  test.beforeEach(async ({ context, page }) => {
    if (authenticatorId) {
      await cdp?.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
      authenticatorId = undefined;
    }

    cdp = await context.newCDPSession(page);
    await expect(cdp).toBeDefined();
    await cdp.send('WebAuthn.enable');

    // Starts with UV succeeding so setup steps (e.g. registering a device before testing
    // an auth failure) work; individual tests call WebAuthn.setUserVerified(false) right
    // before the operation that should fail, which Chromium surfaces as NotAllowedError —
    // simulating the user canceling the prompt.
    const response = await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal', // platform authenticator
        hasResidentKey: true, // allow discoverable credentials (passkeys)
        hasUserVerification: true, // device supports UV
        isUserVerified: true, // simulate successful UV (PIN/biometric) by default
        automaticPresenceSimulation: true, // auto "touch"/presence
      },
    });
    authenticatorId = response.authenticatorId;
  });

  test.afterEach(async () => {
    if (authenticatorId) {
      await cdp?.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
      authenticatorId = undefined;
    }
    await cdp?.send('WebAuthn.disable');
  });
  test('Registration shows NotAllowedError when the WebAuthn prompt is canceled', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);

    await navigate(`/?clientId=${clientId}&acr_values=${policyId}`);
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    if (!cdp || !authenticatorId) {
      throw new Error('Missing virtual authenticator');
    }

    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await page.getByRole('button', { name: 'Biometrics/Security Key' }).click();

    // Make user verification fail for this authenticator so the registration attempt is
    // rejected with NotAllowedError — simulating the user canceling the prompt.
    await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false });
    await page.getByRole('button', { name: 'FIDO Register' }).click();

    await expect(page.getByText('FIDO Registration Error - NotAllowedError')).toBeVisible();
    await expect(page.getByRole('button', { name: 'FIDO Register' })).toBeVisible();
  });

  test('Device authentication shows NotAllowedError when the WebAuthn prompt is canceled', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);

    await navigate(`/?clientId=${clientId}&acr_values=${policyId}`);
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    if (!cdp || !authenticatorId) {
      throw new Error('Missing virtual authenticator');
    }

    // Register a credential so there is a device to authenticate with.
    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await page.getByRole('button', { name: 'Biometrics/Security Key' }).click();
    await page.getByRole('button', { name: 'FIDO Register' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'DEVICE_AUTHENTICATION' }).click();
    await page.getByRole('button', { name: 'Biometrics/Security Key' }).last().click();

    // Make user verification fail for this authenticator so the assertion attempt is
    // rejected with NotAllowedError — simulating the user canceling the prompt.
    await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false });
    await page.getByRole('button', { name: 'FIDO Authenticate' }).click();

    await expect(page.getByText('FIDO Authentication Error - NotAllowedError')).toBeVisible();
    await expect(page.getByRole('button', { name: 'FIDO Authenticate' })).toBeVisible();
  });

  test('Usernameless authentication shows NotAllowedError when the WebAuthn prompt is canceled', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);

    await navigate(`/?clientId=${clientId}&acr_values=${policyId}`);
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    if (!cdp || !authenticatorId) {
      throw new Error('Missing virtual authenticator');
    }

    // Register a discoverable credential so there is a passkey to authenticate with.
    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await page.getByRole('button', { name: 'Biometrics/Security Key' }).click();
    await page.getByRole('button', { name: 'FIDO Register' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    await page.getByRole('button', { name: 'USER_NAMELESS' }).click();
    await expect(page.getByText('FIDO2 Authentication')).toBeVisible();

    // Make user verification fail for this authenticator so the assertion attempt is
    // rejected with NotAllowedError — simulating the user canceling the prompt.
    await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false });
    await page.getByRole('button', { name: 'FIDO Authenticate' }).click();

    await expect(page.getByText('FIDO Usernameless Error - NotAllowedError')).toBeVisible();
    await expect(page.getByRole('button', { name: 'FIDO Authenticate' })).toBeVisible();
  });
});
