/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test, Page } from '@playwright/test';
import type { CDPSession } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test.use({ browserName: 'chromium' });

test.describe('WebAuthn registration delete devices', () => {
  let cdp: CDPSession | undefined;
  let authenticatorId: string | undefined;

  async function login(page: Page, journey = 'Login'): Promise<void> {
    const { clickButton, navigate } = asyncEvents(page);

    await navigate(`/?clientId=tenant&journey=${journey}`);
    await expect(page.getByLabel('User Name')).toBeVisible();

    await page.getByLabel('User Name').fill(username);
    await page.getByLabel('Password').fill(password);
    await clickButton('Submit', '/authenticate');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  }

  async function logout(page: Page): Promise<void> {
    const { clickButton } = asyncEvents(page);
    await clickButton('Logout', '/sessions');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  }

  async function getDevicesBeforeSession(page: Page): Promise<void> {
    const getButton = page.getByRole('button', { name: 'Get Registered Devices' });
    await expect(getButton).toBeVisible();
    await getButton.click();
    await expect(page.locator('#deviceStatus')).toContainText('Devices before session:');
  }

  async function deleteDevicesInSession(page: Page): Promise<void> {
    await login(page);

    const deleteButton = page.getByRole('button', { name: 'Delete Devices From This Session' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    await expect(page.locator('#deviceStatus')).toContainText(
      /Deleted|No devices found in this session|No devices found/,
    );

    await logout(page);
  }

  async function completeAuthenticationJourney(page: Page): Promise<void> {
    const { clickButton, navigate } = asyncEvents(page);

    await navigate('/?clientId=tenant&journey=TEST_WebAuthnAuthentication_UsernamePassword');
    await expect(page.getByLabel('User Name')).toBeVisible();
    await page.getByLabel('User Name').fill(username);
    await clickButton('Submit', '/authenticate');

    await expect(page.getByLabel('Password')).toBeVisible();
    await page.getByLabel('Password').fill(password);
    await clickButton('Submit', '/authenticate');

    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  }

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

    await login(page);
    await getDevicesBeforeSession(page);
    await logout(page);
  });

  test.afterEach(async ({ page }) => {
    await page.unroute('**/*');

    try {
      await deleteDevicesInSession(page);
    } catch (error) {
      console.error('Delete failed:', error);
    }

    if (!cdp) {
      return;
    }

    if (authenticatorId) {
      await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    }

    await cdp.send('WebAuthn.disable');
  });

  async function completeRegistrationJourney(page): Promise<void> {
    await login(page, 'TEST_WebAuthn-Registration');
  }

  test('should register multiple devices, authenticate and delete devices', async ({ page }) => {
    await completeRegistrationJourney(page);
    await logout(page);

    await completeRegistrationJourney(page);
    await logout(page);

    await completeAuthenticationJourney(page);

    const deleteButton = page.getByRole('button', { name: 'Delete Devices From This Session' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(page.locator('#deviceStatus')).toContainText(
      'Deleted 2 WebAuthn device(s) for user',
    );

    await logout(page);
  });

  test('should delete all registered devices', async ({ page }) => {
    await completeRegistrationJourney(page);

    const deleteAllButton = page.getByRole('button', { name: 'Delete All Registered Devices' });
    await expect(deleteAllButton).toBeVisible();
    await deleteAllButton.click();

    await expect(page.locator('#deviceStatus')).toContainText('Deleted');
    await expect(page.locator('#deviceStatus')).toContainText('registered WebAuthn device(s)');
  });
});
