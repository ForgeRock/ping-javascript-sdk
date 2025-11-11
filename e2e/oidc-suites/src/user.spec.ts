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
    const { clickButton, clickWithRedirect, navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    await clickWithRedirect('Login (Background)', '**/am/XUI/**');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await clickWithRedirect('Next', 'http://localhost:8443/ping-am/**');

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await expect(page.locator('#accessToken-0')).not.toBeEmpty();

    await clickButton('User Info', '/userinfo');

    await expect(page.locator('#userInfo')).not.toBeEmpty();
    await expect(page.getByText('Sdk User')).toBeVisible();
    await expect(page.getByText('sdkuser@example.com')).toBeVisible();
  });

  test('get user info from PingOne', async ({ page }) => {
    const { clickButton, clickWithRedirect, navigate } = asyncEvents(page);
    await navigate('/ping-one/');

    await clickWithRedirect('Login (Background)', '**/signon/**');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await clickWithRedirect('Sign On', 'http://localhost:8443/ping-one/**');

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await expect(page.locator('#accessToken-0')).not.toBeEmpty();

    await clickButton('User Info', '/userinfo');

    await expect(page.locator('#userInfo')).not.toBeEmpty();
    await expect(page.getByText('demouser')).toBeVisible();
    await expect(page.getByText('demouser@user.com')).toBeVisible();
  });

  test('get user info should error with missing token', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    await page.getByRole('button', { name: 'User Info' }).click();

    await expect(page.locator('#userInfo')).not.toBeVisible();
    await expect(page.locator('.error')).toContainText(`"error": "No access token found"`);
    await expect(page.locator('.error')).toContainText(`"type": "auth_error"`);
  });
});
