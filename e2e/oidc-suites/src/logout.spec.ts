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

test.describe('Logout tests', () => {
  test('PingAM login then logout', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    let endSessionStatus, revokeStatus;
    page.on('response', (response) => {
      const responseUrl = response.url();
      const status = response.ok();

      if (responseUrl.includes('/endSession?id_token_hint')) {
        endSessionStatus = status;
      }
      if (responseUrl.includes('/revoke')) {
        revokeStatus = status;
      }
    });

    await clickButton('Login (Background)', 'https://openam-sdks.forgeblocks.com/');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    const promise = page.waitForURL('http://localhost:8443/ping-am/**');
    await page.getByRole('button', { name: 'Next' }).click();

    /**
     * This block is flakey, changing to this pattern
     * https://playwright.dev/docs/network#network-events
     **/
    await promise;
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeHidden();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeVisible();

    expect(endSessionStatus).toBeTruthy();
    expect(revokeStatus).toBeTruthy();
  });

  test('PingOne login then logout', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

    let endSessionStatus, revokeStatus;
    page.on('response', (response) => {
      const responseUrl = response.url();
      const status = response.ok();

      if (responseUrl.includes('/as/idpSignoff?id_token_hint')) {
        endSessionStatus = status;
      }
      if (responseUrl.includes('/revoke')) {
        revokeStatus = status;
      }
    });

    await clickButton('Login (Background)', 'https://apps.pingone.ca/');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await Promise.all([
      page.waitForURL('http://localhost:8443/ping-one/**'),
      page.getByRole('button', { name: 'Sign On' }).click(),
    ]);
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeHidden();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeVisible();

    expect(endSessionStatus).toBeTruthy();
    expect(revokeStatus).toBeTruthy();
  });
});
