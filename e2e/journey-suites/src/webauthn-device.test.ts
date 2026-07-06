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

/**
 * Cleanup: deletes only the single credential this run registered, via the journey-app's own
 * delete flow. Run from `afterEach` so a failed step can't leave the credential behind — orphans
 * otherwise accumulate past the browser's allowCredentials cap and break auth for later runs.
 * Deletes just this run's credential (never bulk-deletes) since the account is shared.
 * Logs in fresh because the test may have logged out or failed mid-auth.
 */
async function cleanUpRegisteredDevice(page: Page, cdp: CDPSession, authenticatorId: string) {
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId });
  const credentialId = credentials[0]?.credentialId;
  if (!credentialId) {
    return;
  }

  const base64Url = credentialId.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
  const { clickButton, navigate } = asyncEvents(page);
  await navigate(
    `/?clientId=tenant&journey=Login&${WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM}=${base64Url}`,
  );
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');
  await page.getByRole('button', { name: 'Delete Webauthn Device' }).click();
  await expect(page.locator('#deviceStatus')).toContainText('Deleted WebAuthn device');
}

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

  test.afterEach(async ({ page }) => {
    await cleanUpRegisteredDevice(page, cdp, authenticatorId);
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

  test.afterEach(async ({ page }) => {
    await cleanUpRegisteredDevice(page, cdp, authenticatorId);
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

  // 001: no autocomplete values, default mediation, button enabled
  // AM set manualButtonEnabled but did not emit autocomplete values. The manual button only
  // renders inside the conditional path — which is not entered without autocomplete values.
  // This asserts that button alone is insufficient to reach the passkey path.
  test('button only (001) — manual button does NOT appear despite AM enabling it, falls back to traditional WebAuthn', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_button');

      await expect(page.locator('input[autocomplete="username webauthn"]')).toHaveCount(0);
      // Key assertion: AM enabled manualButtonEnabled but the button does not appear because
      // autocomplete values were absent and the conditional path was never entered.
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

  // 101: autocomplete values, default mediation, button "enabled" in journey config
  // AM only sets manualButtonEnabled: true when mediation is conditional — the two are coupled.
  // With default mediation this journey sends manualButtonEnabled: false, so the button never
  // appears even though autocomplete values are present and the conditional path is entered.
  test('autocomplete + button (101) — autofill input present, manual button absent because AM sends manualButtonEnabled: false without conditional mediation', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      // Hold the fired conditional request open so the rendered autofill UI can be asserted.
      await setPresenceSimulation(false);
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_autocomplete_button');

      await expect(page.locator('input[autocomplete="username webauthn"]')).toBeVisible();
      // No button: AM does not set manualButtonEnabled: true without conditional mediation.
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0);
    });
  });

  // 011: no autocomplete values, conditional mediation, button enabled
  // No autocomplete signal means the conditional path is never entered — button does not appear.
  test('conditional + button (011) — manual button does NOT appear, falls back to traditional WebAuthn', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate', async () => {
      await page.context().clearCookies();
      await navigate('/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_conditional_button');

      await expect(page.locator('input[autocomplete="username webauthn"]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });
  });

  // 111: autocomplete values, conditional mediation, button enabled — the full passkey experience.
  // All three signals present, so the step offers two distinct ways to authenticate. We cover both.

  // 111a: silent autofill via the username field. The conditional request runs in the background
  // and the virtual authenticator resolves it without the user touching the manual button.
  test('all enabled (111a) — autofill input and manual button both render, silent passkey auth via username field', async ({
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
        '/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_autocomplete_conditional_button',
      );

      await expect(page.locator('input[autocomplete="username webauthn"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toBeVisible();
    });
  });

  // 111b: explicit authentication via the "Sign in with a passkey" button. Clicking it aborts the
  // background conditional request and forces a modal prompt (mediationOverride: 'optional'),
  // which the virtual authenticator resolves — exercising the manual button path end to end.
  test('all enabled (111b) — clicking "Sign in with a passkey" authenticates via a forced modal prompt', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    await test.step('Register', async () => {
      await registerPasskey(page, navigate, clickButton);
    });
    await test.step('Authenticate via the manual button', async () => {
      await page.context().clearCookies();
      // Hold the background conditional request open so it cannot silently log in before the
      // manual button is clicked; the button aborts it and fires the forced modal request.
      await setPresenceSimulation(false);
      await navigate(
        '/?clientId=tenant&journey=TEST_AutofillPasskeyWebAuthn_autocomplete_conditional_button',
      );

      await expect(page.getByRole('button', { name: 'Sign in with a passkey' })).toBeVisible();

      // Re-enable presence so the forced modal request the button fires resolves.
      await setPresenceSimulation(true);
      await clickButton('Sign in with a passkey', '/authenticate');
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });
  });
});
