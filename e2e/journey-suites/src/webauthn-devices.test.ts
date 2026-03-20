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

test.use({ browserName: 'chromium' });

function toBase64Url(value: string): string {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

test.describe('WebAuthn register, authenticate, and delete device', () => {
  let cdp: CDPSession | undefined;
  let authenticatorId: string | undefined;

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
    if (cdp && authenticatorId) {
      await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
      await cdp.send('WebAuthn.disable');
    }
  });

  test('should register, authenticate, and delete a device', async ({ page }) => {
    if (!cdp || !authenticatorId) {
      throw new Error('Virtual authenticator was not initialized');
    }

    const { credentials: initialCredentials } = await cdp.send('WebAuthn.getCredentials', {
      authenticatorId,
    });
    expect(initialCredentials).toHaveLength(0);

    // login with username and password and register a device
    const { clickButton, navigate } = asyncEvents(page);
    await navigate(`/?clientId=tenant&journey=TEST_WebAuthn-Registration`);
    await expect(page.getByLabel('User Name')).toBeVisible();
    await page.getByLabel('User Name').fill(username);
    await page.getByLabel('Password').fill(password);
    await clickButton('Submit', '/authenticate');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // capture and assert virtual authenticator credentialId
    const { credentials: recordedCredentials } = await cdp.send('WebAuthn.getCredentials', {
      authenticatorId,
    });
    expect(recordedCredentials).toHaveLength(1);
    const virtualCredentialId = recordedCredentials[0]?.credentialId;
    expect(virtualCredentialId).toBeTruthy();
    if (!virtualCredentialId) {
      throw new Error('Registered WebAuthn credential id was not captured');
    }

    // assert registered credentialId in query param matches virtual authenticator credentialId
    const registrationUrl = new URL(page.url());
    const registrationUrlValues = Array.from(registrationUrl.searchParams.values());
    expect(registrationUrlValues).toContain(toBase64Url(virtualCredentialId));

    // logout
    await clickButton('Logout', '/sessions');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    // capture credentialId from registrationUrl query param
    const authenticationUrl = new URL(registrationUrl.toString());
    authenticationUrl.searchParams.set('journey', 'TEST_WebAuthnAuthentication');

    // authenticate with registered webauthn device
    await navigate(authenticationUrl.toString());
    await expect(page.getByLabel('User Name')).toBeVisible();
    await page.getByLabel('User Name').fill(username);
    await clickButton('Submit', '/authenticate');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // delete registered webauthn device
    await page.getByRole('button', { name: 'Delete Webauthn Device' }).click();
    const deviceStatus = page.locator('#deviceStatus');
    await expect(deviceStatus).toContainText('Deleted WebAuthn device');
    await expect(deviceStatus).toContainText(
      `credential id ${toBase64Url(virtualCredentialId)} for user`,
    );
  });
});
