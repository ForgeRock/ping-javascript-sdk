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

test.describe('PingAM tokens', () => {
  test('login and get tokens', async ({ page }) => {
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

    await page.getByRole('button', { name: 'Get Tokens' }).click();
    await expect(page.locator('#accessToken-1')).not.toBeEmpty();

    const accessToken0 = await page.locator('#accessToken-0').textContent();
    const accessToken1 = await page.locator('#accessToken-1').textContent();
    await expect(accessToken0).toBe(accessToken1);
  });

  test('login and renew tokens', async ({ page }) => {
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

    await page.evaluate(() => window.localStorage.clear());
    await page.getByRole('button', { name: 'Renew Tokens' }).click();

    await expect(page.locator('#accessToken-1')).not.toBeEmpty();

    const accessToken0 = await page.locator('#accessToken-0').textContent();
    const accessToken1 = await page.locator('#accessToken-1').textContent();
    await expect(accessToken0).not.toBe(accessToken1);
  });

  test('login and revoke tokens', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await clickButton('Login (Background)', 'https://openam-sdks.forgeblocks.com/');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.waitForURL('http://localhost:8443/ping-am/**');

    await expect(page.locator('#accessToken-0')).not.toBeEmpty();

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await page.getByRole('button', { name: 'Revoke Token' }).click();
    await expect(page.getByText('Token successfully revoked')).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem('pic-oidcTokens'));
    await expect(token).toBeFalsy();
  });

  test('renew tokens without logging in should error', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await page.getByRole('button', { name: 'Renew Tokens' }).click();

    await expect(page.locator('.error')).toContainText(`"error": "interaction_required"`);
    await expect(page.locator('.error')).toContainText(`"type": "auth_error"`);
    await expect(page.locator('.error')).toContainText(
      'The request requires some interaction that is not allowed.',
    );
  });
});

test.describe('PingOne tokens', () => {
  test('login and get tokens', async ({ page }) => {
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

    await page.getByRole('button', { name: 'Get Tokens' }).click();
    await expect(page.locator('#accessToken-1')).not.toBeEmpty();

    const accessToken0 = await page.locator('#accessToken-0').textContent();
    const accessToken1 = await page.locator('#accessToken-1').textContent();
    await expect(accessToken0).toBe(accessToken1);
  });

  test('login and renew tokens', async ({ page }) => {
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

    await page.evaluate(() => window.localStorage.clear());
    await page.getByRole('button', { name: 'Renew Tokens' }).click();

    await expect(page.locator('#accessToken-1')).not.toBeEmpty();

    const accessToken0 = await page.locator('#accessToken-0').textContent();
    const accessToken1 = await page.locator('#accessToken-1').textContent();
    await expect(accessToken0).not.toBe(accessToken1);
  });

  test('login and revoke tokens', async ({ page }) => {
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

    await expect(page.locator('#accessToken-0')).not.toBeEmpty();

    await page.getByRole('button', { name: 'Revoke Token' }).click();
    await expect(page.getByText('Token successfully revoked')).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem('pic-oidcTokens'));
    await expect(token).toBeFalsy();
  });

  test('renew tokens without logging in should error', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

    await page.getByRole('button', { name: 'Renew Tokens' }).click();

    await expect(page.locator('.error')).toContainText(`"error": "LOGIN_REQUIRED"`);
    await expect(page.locator('.error')).toContainText(`"type": "auth_error"`);
    await expect(page.locator('.error')).toContainText('User authentication is required');
  });
});

test('get tokens without logging in should error', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/ping-am/');
  expect(page.url()).toBe('http://localhost:8443/ping-am/');

  await page.getByRole('button', { name: 'Get Tokens' }).click();

  await expect(page.locator('.error')).toContainText(`"error": "No tokens found"`);
  await expect(page.locator('.error')).toContainText(`"type": "state_error"`);
});

test('revoke tokens should error with missing token', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/ping-am/');
  expect(page.url()).toBe('http://localhost:8443/ping-am/');

  await page.getByRole('button', { name: 'Revoke Token' }).click();

  await expect(page.locator('.error')).toContainText(`"error": "No access token found"`);
  await expect(page.locator('.error')).toContainText(`"type": "state_error"`);
});
