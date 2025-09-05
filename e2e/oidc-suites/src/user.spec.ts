/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { test, expect } from '@playwright/test';
import {
  pingAmUsername,
  pingAmPassword,
  pingOneUsername,
  pingOnePassword,
} from './utils/demo-users.js';
import { asyncEvents } from './utils/async-events.js';

test.describe('User tests', () => {
  test('get user info from PingAM', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await clickButton('Login (Background)', 'https://openam-sdks.forgeblocks.com/');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.waitForURL('http://localhost:8443/ping-am/**', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await clickButton('User Info', 'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/userinfo');
    await expect(page.locator('#userInfo')).not.toBeEmpty();
    await expect(page.getByText('Sdk User')).toBeVisible();
    await expect(page.getByText('sdkuser@example.com')).toBeVisible();
  });

  test('get user info from PingOne', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

    await clickButton('Login (Background)', 'https://apps.pingone.ca/');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.waitForURL('http://localhost:8443/ping-one/**', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await clickButton(
      'User Info',
      'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/userinfo',
    );
    await expect(page.locator('#userInfo')).not.toBeEmpty();
    await expect(page.getByText('demouser')).toBeVisible();
    await expect(page.getByText('demouser@user.com')).toBeVisible();
  });

  test('get user info should error with missing token', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await page.getByRole('button', { name: 'User Info' }).click();

    await expect(page.locator('#userInfo')).not.toBeVisible();
    await expect(page.locator('.error')).toContainText(`"error": "No access token found"`);
    await expect(page.locator('.error')).toContainText(`"type": "auth_error"`);
  });
});
