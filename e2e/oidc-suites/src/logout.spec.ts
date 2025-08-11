import { test, expect } from '@playwright/test';
import {
  pingAmUsername,
  pingAmPassword,
  pingOneUsername,
  pingOnePassword,
} from './utils/demo-users.js';

const TIMEOUT = 3000;

test.describe('Logout tests', () => {
  test('PingAM login then logout', async ({ page }) => {
    await page.goto('/ping-am/');
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

    await expect(async () => {
      await page.getByRole('button', { name: 'Login (Background)' }).click();
      await page.waitForURL('https://openam-sdks.forgeblocks.com/**', { timeout: TIMEOUT });
    }).toPass();

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.waitForURL('http://localhost:8443/ping-am/**');
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeHidden();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeVisible();

    expect(endSessionStatus).toBeTruthy();
    expect(revokeStatus).toBeTruthy();
  });

  test('PingOne login then logout', async ({ page }) => {
    await page.goto('/ping-one/');
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

    await expect(async () => {
      await page.getByRole('button', { name: 'Login (Background)' }).click();
      await page.waitForURL('https://apps.pingone.ca/**', { timeout: TIMEOUT });
    }).toPass();

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.waitForURL('http://localhost:8443/ping-one/**');
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeHidden();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login (Background)' })).toBeVisible();

    expect(endSessionStatus).toBeTruthy();
    expect(revokeStatus).toBeTruthy();
  });
});
