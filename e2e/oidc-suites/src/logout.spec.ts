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
    const { clickButton, clickWithRedirect, navigate } = asyncEvents(page);
    await navigate('/ping-am/');

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

    await clickWithRedirect('Login (Background)', '**/am/XUI/**');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await clickWithRedirect('Next', 'http://localhost:8443/ping-am/**');

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await clickButton('Logout', '/revoke');

    expect(endSessionStatus).toBeTruthy();
    expect(revokeStatus).toBeTruthy();
  });

  test('PingOne login then logout', async ({ page }) => {
    const { clickButton, clickWithRedirect, navigate } = asyncEvents(page);
    await navigate('/ping-one/');

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

    await clickWithRedirect('Login (Background)', '**/signon/**');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await clickWithRedirect('Sign On', 'http://localhost:8443/ping-one/**');

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await clickButton('Logout', '/revoke');

    expect(endSessionStatus).toBeTruthy();
    expect(revokeStatus).toBeTruthy();
  });
});
