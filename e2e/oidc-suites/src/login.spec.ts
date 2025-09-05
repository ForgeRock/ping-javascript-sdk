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

test.describe('PingAM login and get token tests', () => {
  test('background login with valid credentials', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await clickButton('Login (Background)', '/authorize');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken-0')).not.toBeEmpty();
  });

  test('redirect login with valid credentials', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-am/');
    expect(page.url()).toBe('http://localhost:8443/ping-am/');

    await clickButton('Login (Redirect)', '/authorize');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken-0')).not.toBeEmpty();
  });

  test('background login with invalid client id fails', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/?clientid=bad-id');
    expect(page.url()).toBe('http://localhost:8443/ping-am/?clientid=bad-id');

    await page.getByRole('button', { name: 'Login (Background)' }).click();

    await expect(page.locator('.error')).toContainText(`CONFIGURATION_ERROR`);
    await expect(page.locator('.error')).toContainText(
      'Configuration error. Please check your OAuth configuration, like clientId or allowed redirect URLs.',
    );
    await expect(page.locator('.error')).toContainText(`"type": "network_error"`);
  });
});

test.describe('PingOne login and get token tests', () => {
  test('background login with valid credentials', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

    await clickButton('Login (Background)', '/authorize');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.waitForURL('http://localhost:8443/ping-one/**');
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken-0')).not.toBeEmpty();
  });

  test('redirect login with valid credentials', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-one/');
    expect(page.url()).toBe('http://localhost:8443/ping-one/');

    await clickButton('Login (Redirect)', '/authorize');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.waitForURL('http://localhost:8443/ping-one/**');
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken-0')).not.toBeEmpty();
  });

  test('login with invalid client id fails', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-one/?clientid=bad-id');
    expect(page.url()).toBe('http://localhost:8443/ping-one/?clientid=bad-id');

    await page.getByRole('button', { name: 'Login (Background)' }).click();

    await expect(page.locator('.error')).toContainText(`CONFIGURATION_ERROR`);
    await expect(page.locator('.error')).toContainText(
      'Configuration error. Please check your OAuth configuration, like clientId or allowed redirect URLs.',
    );
    await expect(page.locator('.error')).toContainText(`"type": "network_error"`);
  });

  test('login with pi.flow response mode', async ({ page }) => {
    const { navigate, clickButton } = asyncEvents(page);
    await navigate('/ping-one/?piflow=true');
    expect(page.url()).toBe('http://localhost:8443/ping-one/?piflow=true');

    await page.on('request', (request) => {
      const method = request.method();
      const requestUrl = request.url();

      if (method === 'POST' && requestUrl.includes('/as/authorize')) {
        expect(requestUrl).toContain('response_mode=pi.flow');
      }
    });

    await clickButton('Login (Background)', '/authorize');

    await page.getByLabel('Username').fill(pingOneUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingOnePassword);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.waitForURL('http://localhost:8443/ping-one/**');
    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');
    await expect(page.locator('#accessToken-0')).not.toBeEmpty();
  });
});

test('login with invalid state fails with error', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/ping-am/?code=12345&state=abcxyz');
  expect(page.url()).toBe('http://localhost:8443/ping-am/?code=12345&state=abcxyz');

  await expect(page.locator('.error')).toContainText(`"error": "State mismatch"`);
  await expect(page.locator('.error')).toContainText(`"type": "state_error"`);
  await expect(page.locator('.error')).toContainText(
    'The provided state does not match the stored state. This is likely due to passing in used, returned, authorize parameters.',
  );
});

test('oidc client fails to initialize with bad wellknown', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/ping-am/?wellknown=bad-wellknown');
  expect(page.url()).toBe('http://localhost:8443/ping-am/?wellknown=bad-wellknown');

  await page.getByRole('button', { name: 'Login (Background)' }).click();

  await expect(page.locator('.error')).toContainText(
    'Authorization endpoint not found in wellknown configuration',
  );
  await expect(page.locator('.error')).toContainText('wellknown_error');
});
