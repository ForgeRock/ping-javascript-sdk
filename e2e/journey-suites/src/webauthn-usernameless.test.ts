import { test, expect } from '@playwright/test';
import type { CDPSession } from 'playwright';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test.use({ browserName: 'chromium' }); // ensure CDP/WebAuthn is available

test('Register and authenticate with webauthn device (usernameless)', async ({ page, context }) => {
  let cdp: CDPSession | undefined;
  let authenticatorId: string | undefined;
  let webauthnEnabled = false;

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
  });

  const { navigate } = asyncEvents(page);

  try {
    // First, register a credential we can use later (resident passkey)
    await test.step('Navigate to registration journey (usernameless)', async () => {
      await navigate('/?clientId=TEST_WebAuthn-Registration-UsernameToDevice');
      await expect(page).toHaveURL(
        'http://localhost:5829/?clientId=TEST_WebAuthn-Registration-UsernameToDevice',
      );
    });

    await test.step('Complete primary credentials', async () => {
      await page.getByLabel('User Name').fill(username);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Submit' }).click();
    });

    await test.step('Register WebAuthn credential (resident key)', async () => {
      // With the virtual authenticator present and presence auto-simulated,
      // registration will complete without any OS prompts.
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    await test.step('Logout after registration', async () => {
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    });

    // Now authenticate via usernameless WebAuthn (username from device)
    await test.step('Navigate to usernameless authentication journey', async () => {
      await navigate('/?clientId=TEST_WebAuthnAuthentication_Usernameless');
      await expect(page).toHaveURL(
        'http://localhost:5829/?clientId=TEST_WebAuthnAuthentication_Usernameless',
      );
    });

    await test.step('Authenticate WebAuthn credential (usernameless)', async () => {
      if (!cdp || !authenticatorId) {
        throw new Error('Expected CDP session and authenticator to be configured');
      }
      // Server UV is Discouraged; UV=true on the device is acceptable.
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
