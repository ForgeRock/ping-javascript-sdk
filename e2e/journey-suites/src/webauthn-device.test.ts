/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import type { CDPSession } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

const WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM = 'webauthnCredentialId';

test.use({ browserName: 'chromium' });

test.describe('WebAuthn register, authenticate, and delete device', () => {
  let cdp!: CDPSession;
  let authenticatorId!: string;

  test.beforeEach(async ({ context, page }) => {
    cdp = await context.newCDPSession(page);
    await cdp.send('WebAuthn.enable');
    const response = await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
        automaticPresenceSimulation: true,
      },
    });
    authenticatorId = response.authenticatorId;
  });

  test.afterEach(async () => {
    await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    await cdp.send('WebAuthn.disable');
  });

  test('should register, authenticate, and delete a device', async ({ page }) => {
    const { clickButton, navigate } = asyncEvents(page);

    const registeredCredentialId =
      await test.step('Register a WebAuthn device and capture the device credential id', async () => {
        // we start with an assertion that no credentials exist in the virtual authenticator
        const { credentials: initialCredentials } = await cdp.send('WebAuthn.getCredentials', {
          authenticatorId,
        });
        expect(initialCredentials).toHaveLength(0);

        await navigate('/?clientId=tenant&journey=TEST_WebAuthn-Registration');
        await expect(page.getByLabel('User Name')).toBeVisible();
        await page.getByLabel('User Name').fill(username);
        await page.getByLabel('Password').fill(password);
        await clickButton('Submit', '/authenticate');
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

        // after registration, we can assert that a credential has in fact been generated
        // since the length of credentials array increased by 1
        const { credentials: recordedCredentials } = await cdp.send('WebAuthn.getCredentials', {
          authenticatorId,
        });
        expect(recordedCredentials).toHaveLength(1);

        const virtualCredentialId = recordedCredentials[0]?.credentialId;
        expect(virtualCredentialId).toBeTruthy();
        if (!virtualCredentialId) {
          throw new Error('Registered WebAuthn credential id was not captured');
        }

        // convert credential id to base64Url
        return virtualCredentialId.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
      });

    const authenticationUrl =
      await test.step('Pass the registered credential id into the journey-app integration', async () => {
        const url = new URL(page.url());
        url.searchParams.set(WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM, registeredCredentialId);
        url.searchParams.set('journey', 'TEST_WebAuthnAuthentication');

        // this assertion might look redundant but it's good to assert that the query param
        // was indeed set correctly and that it matches the registered credential id
        expect(Array.from(url.searchParams.values())).toContain(registeredCredentialId);

        return url.toString();
      });

    await test.step('Authenticate with the registered WebAuthn device', async () => {
      await clickButton('Logout', '/sessions');
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

      await navigate(authenticationUrl);
      await expect(page.getByLabel('User Name')).toBeVisible();
      await page.getByLabel('User Name').fill(username);
      await clickButton('Submit', '/authenticate');
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    await test.step('Delete the registered WebAuthn device through the journey-app integration', async () => {
      await page.getByRole('button', { name: 'Delete Webauthn Device' }).click();

      const deviceStatus = page.locator('#deviceStatus');
      await expect(deviceStatus).toContainText('Deleted WebAuthn device');
      await expect(deviceStatus).toContainText(`credential id ${registeredCredentialId} for user`);
    });
  });
});

test.describe('WebAuthn conditional autofill (passkey)', () => {
  let cdp!: CDPSession;
  let authenticatorId!: string;

  test.beforeEach(async ({ context, page }) => {
    // Chromium + CDP WebAuthn virtual authenticator is required for repeatable automation.
    cdp = await context.newCDPSession(page);
    await cdp.send('WebAuthn.enable');

    // Configure a platform authenticator with resident keys and auto presence simulation.
    const response = await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
        automaticPresenceSimulation: true,
      },
    });
    authenticatorId = response.authenticatorId;
  });

  test.afterEach(async () => {
    await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    await cdp.send('WebAuthn.disable');
  });

  // TODO: This test is currently skipped because the journey used does not allow enabling conditional mediation in admin console
  // When we start using v2.0 of Page Node in admin console, this test can be executed again
  test.skip('registers a passkey then authenticates via conditional autofill', async ({ page }) => {
    const { clickButton, navigate } = asyncEvents(page);

    await test.step('Register a WebAuthn credential', async () => {
      // Start with an empty virtual authenticator.
      const { credentials: initialCredentials } = await cdp.send('WebAuthn.getCredentials', {
        authenticatorId,
      });
      expect(initialCredentials).toHaveLength(0);

      // Run a registration journey that creates a credential in the authenticator.
      await navigate('/?clientId=tenant&journey=TEST_WebAuthn-Registration');
      await expect(page.getByLabel('User Name')).toBeVisible();
      await page.getByLabel('User Name').fill(username);
      await page.getByLabel('Password').fill(password);
      await clickButton('Submit', '/authenticate');
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

      const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId });
      expect(credentials.length).toBeGreaterThan(0);
    });

    await test.step('Authenticate using conditional UI / passkey autofill', async () => {
      // Ensure we are not reusing an existing AM session.
      // This makes the test exercise passkey auth, not cookie auth.
      await page.context().clearCookies();

      // This journey emits conditional mediation metadata and should complete via background
      // WebAuthn (journey-app triggers the request and submits when a credential is returned).
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn');

      const conditionalInput = page.locator('input[autocomplete="webauthn"]');
      await expect(conditionalInput).toBeVisible({ timeout: 10000 });
      await conditionalInput.focus();
      await expect(conditionalInput).toBeFocused();

      // Re-enable presence simulation so the in-flight WebAuthn request can resolve.
      await cdp.send('WebAuthn.setAutomaticPresenceSimulation', {
        authenticatorId,
        enabled: true,
      });

      // With a virtual authenticator configured for automatic presence simulation, this should
      // complete without any manual click.
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Complete' })).toBeVisible();
    });
  });
});
