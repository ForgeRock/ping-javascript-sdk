import { test, expect } from '@playwright/test';
import {
  pingAmUsername,
  pingAmPassword,
  pingOneUsername,
  pingOnePassword,
} from './utils/demo-users.js';

const TIMEOUT = 3000;

test.describe('PingAM login and get token tests', () => {
  test('background login with valid credentials', async ({ page }) => {
    await page.goto('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await expect(async () => {
      await page.getByRole('button', { name: 'Login (Background)' }).click();
      await page.waitForURL('https://openam-sdks.forgeblocks.com/**', { timeout: TIMEOUT });
    }).toPass();

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken')).not.toBeEmpty();
  });

  test('redirect login with valid credentials', async ({ page }) => {
    await page.goto('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await expect(async () => {
      await page.getByRole('button', { name: 'Login (Redirect)' }).click();
      await page.waitForURL('https://openam-sdks.forgeblocks.com/**', { timeout: TIMEOUT });
    }).toPass();

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken')).not.toBeEmpty();
  });
});

test.describe('PingOne login and get token tests', () => {
  test('background login with valid credentials', async ({ page }) => {
    await page.goto('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

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
    await expect(page.locator('#accessToken')).not.toBeEmpty();
  });

  test('redirect login with valid credentials', async ({ page }) => {
    await page.goto('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

    await expect(async () => {
      await page.getByRole('button', { name: 'Login (Redirect)' }).click();
      await page.waitForURL('https://apps.pingone.ca/**', { timeout: TIMEOUT });
    }).toPass();

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.waitForURL('http://localhost:8443/ping-one/**');
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken')).not.toBeEmpty();
  });
});
