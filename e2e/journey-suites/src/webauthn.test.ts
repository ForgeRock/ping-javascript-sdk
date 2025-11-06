import { test, expect } from '@playwright/test';
import type { CDPSession } from 'playwright';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test.use({ browserName: 'chromium' }); // ensure CDP/WebAuthn is available

test('Register and authenticate with webauthn device', async ({ page, context }) => {
  let cdp: CDPSession | undefined;
  let authenticatorId: string | undefined;
  let webauthnEnabled = false;
  let recordedCredentialIds: string[] = [];

  await test.step('Configure virtual authenticator', async () => {
    cdp = await context.newCDPSession(page);
    await cdp.send('WebAuthn.enable');
    webauthnEnabled = true;

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

    // (Optional) If your server demands toggling UV during tests:
    // await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: true });
  });

  const { navigate } = asyncEvents(page);

  try {
    await test.step('Navigate to registration journey', async () => {
      await navigate('/?clientId=TEST_WebAuthn-Registration');
      await expect(page).toHaveURL('http://localhost:5829/?clientId=TEST_WebAuthn-Registration');
    });

    await test.step('Complete primary credentials', async () => {
      await page.getByLabel('User Name').fill(username);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Submit' }).click();
    });

    await test.step('Register WebAuthn credential', async () => {
      // With the virtual authenticator present and presence auto-simulated,
      // registration will complete without any OS prompts.
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    await test.step('Capture virtual authenticator credentials', async () => {
      if (!cdp || !authenticatorId) {
        throw new Error('Expected CDP session and authenticator to be configured');
      }
      const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId });
      recordedCredentialIds = (credentials || []).map((item) => item.credentialId);
      expect(recordedCredentialIds.length).toBeGreaterThan(0);
    });

    await test.step('Logout after registration', async () => {
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    });

    await test.step('Navigate to authentication journey', async () => {
      await navigate('/?clientId=TEST_WebAuthnAuthentication');
      await expect(page).toHaveURL('http://localhost:5829/?clientId=TEST_WebAuthnAuthentication');
    });

    await test.step('Complete username credential', async () => {
      await page.getByLabel('User Name').fill(username);
      await page.getByRole('button', { name: 'Submit' }).click();
    });

    await test.step('Authenticate WebAuthn credential', async () => {
      if (!cdp || !authenticatorId) {
        throw new Error('Expected CDP session and authenticator to be configured');
      }
      await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: true });
      // With the virtual authenticator present and presence auto-simulated,
      // authentication will complete without any OS prompts.
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    await test.step('Logout after authentication', async () => {
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    });
  } finally {
    if (!cdp) {
      return;
    }

    const activeCdp = cdp;
    await test.step('Remove virtual authenticator', async () => {
      if (authenticatorId) {
        await activeCdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
      }
      if (webauthnEnabled) {
        await activeCdp.send('WebAuthn.disable');
      }
    });
  }
});
