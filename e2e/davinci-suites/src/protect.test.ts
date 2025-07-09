/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test Protect collector with Custom HTML component', async ({ page }) => {
  const davinciFlow = 'ea02bcbfb2112e051c94ee9b08083d2d';
  const { navigate } = asyncEvents(page);
  await navigate(`/?acr_values=${davinciFlow}`);

  await expect(page.url()).toBe(`http://localhost:5829/?acr_values=${davinciFlow}`);

  await expect(page.getByText('JS Protect - Custom HTML Form')).toBeVisible();

  const requests = [];
  page.on('request', (request) => {
    const method = request.method();
    const requestUrl = request.url();
    const payload = request.postDataJSON();
    const data = payload.parameters.data.formData.riskSDK;

    requests.push(requestUrl);

    if (method === 'POST' && requestUrl.includes('customHTMLTemplate')) {
      expect(data).toBeDefined();
      expect(data).toMatch(/^R\/o\//);
    }
  });

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  await expect(
    page.getByText(/Sorry Bot, we cannot let you in this time.|You were blocked by PingOne Risk/),
  ).toBeVisible();

  const protectRequest = requests.some((url) => url.includes('customHTMLTemplate'));
  await expect(protectRequest).toBeTruthy();
});

test('Test Protect collector with P1 Forms component', async ({ page }) => {
  const davinciFlow = '908858ce3a809b579f11f49c4283b7a6';
  const { navigate } = asyncEvents(page);
  await navigate(`/?acr_values=${davinciFlow}`);

  await expect(page.url()).toBe(`http://localhost:5829/?acr_values=${davinciFlow}`);

  await expect(page.getByText('Example - Sign On')).toBeVisible();

  const requests = [];
  page.on('request', (request) => {
    const method = request.method();
    const requestUrl = request.url();
    const payload = request.postDataJSON();
    const data = payload.parameters.data.formData.deviceRisk;

    requests.push(requestUrl);

    if (method === 'POST' && requestUrl.includes('customForm')) {
      expect(data).toBeDefined();
      expect(data).toMatch(/^R\/o\//);
    }
  });

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  await expect(
    page.getByText(/Sorry Bot, we cannot let you in this time.|You were blocked by PingOne Risk/),
  ).toBeVisible();

  const protectRequest = requests.some((url) => url.includes('customForm'));
  await expect(protectRequest).toBeTruthy();
});
