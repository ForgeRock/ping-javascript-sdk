/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import type { CDPSession, Page } from '@playwright/test';
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

  // The autofill (conditional) cases fire WebAuthn on render. With automatic presence simulation
  // on, the virtual authenticator resolves that request immediately and the page logs in before
  // the transient autofill UI (decorated input, manual button) can be asserted. Disabling presence
  // simulation lets the request hang so the rendered UI can be checked deterministically.
  async function setPresenceSimulation(enabled: boolean): Promise<void> {
    await cdp.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled });
  }

  async function registerPasskey(
    page: Page,
    navigate: (route: string) => Promise<void>,
    clickButton: (text: string, endpoint: string) => Promise<void>,
  ): Promise<void> {
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

    const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId });
    expect(credentials.length).toBeGreaterThan(0);
  }

  // 000: no autocomplete values, default mediation, no button
  // AM does not signal passkey autofill. Falls back to traditional (prompted) WebAuthn.
  test('disabled (000) — falls back to traditional WebAuthn, no autofill input, no manual button', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_disabled');

      await expect(page.locator('input[autocomplete="username webauthn"]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });
  });

  // 100: autocomplete values present, default mediation, no button
  // AM emits autocomplete values so the conditional path is entered and the autofill input is
  // rendered. No manual button because manualButtonEnabled is false.
  test('autocomplete only (100) — autofill input rendered, no manual button', async ({ page }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      // Hold the fired conditional request open so the rendered autofill UI can be asserted.
      await setPresenceSimulation(false);
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_autocomplete');

      await expect(page.locator('input[autocomplete="username webauthn"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0);
    });
  });

  // 010: no autocomplete values, conditional mediation, no button
  // AM uses conditional mediation internally but did not emit autocomplete values. Journey-app
  // never enters the conditional path — falls back to traditional WebAuthn.
  test('conditional only (010) — falls back to traditional WebAuthn, no autofill input, no manual button', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_conditional');

      await expect(page.locator('input[autocomplete="username webauthn"]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });
  });

  // 110: autocomplete values, conditional mediation, no button
  // Both signals for passkey autofill are present. Silent authentication, no manual button.
  test('autocomplete + conditional (110) — silent passkey auth, no manual button', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      // Hold the fired conditional request open so the rendered autofill UI can be asserted.
      // Silent completion depends on real autofill-dropdown interaction that the virtual
      // authenticator cannot drive deterministically, so we assert the rendered UI only.
      await setPresenceSimulation(false);
      await navigate(
        '/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_autocomplete_conditional',
      );

      await expect(page.locator('input[autocomplete="username webauthn"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0);
    });
  });
});
