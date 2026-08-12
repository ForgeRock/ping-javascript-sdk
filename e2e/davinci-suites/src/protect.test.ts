/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';

test('Test Protect collector with Custom HTML component', async ({ page }) => {
  const davinciFlow = '244e9bbec113931ae61fd962f0a1fe6c';
  const { navigate } = asyncEvents(page);
  await navigate(`/?clientId=${clientId}&acr_values=${davinciFlow}`);

  await expect(page.url()).toBe(
    `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciFlow}`,
  );

  await expect(page.getByText('JS Protect - Custom HTML Form')).toBeVisible();

  const requests: string[] = [];
  let riskData;
  page.on('request', (request) => {
    const method = request.method();
    const requestUrl = request.url();
    const payload = request.postDataJSON();

    requests.push(requestUrl);

    // Only process POST requests with JSON payloads
    if (method === 'POST' && payload && requestUrl.includes('customHTMLTemplate')) {
      const data = payload.parameters?.data?.formData?.riskSDK;
      if (data) {
        riskData = data;
      }
    }
  });

  const protectPromise = page.waitForRequest(
    (req) =>
      req.method() === 'POST' &&
      req.url().includes('customHTMLTemplate') &&
      req.postDataJSON()?.parameters?.data?.formData?.riskSDK,
  );
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();
  await protectPromise;

  expect(riskData).toBeDefined();
  expect(riskData).toMatch(/^R\/o\//);
});

test('Test Protect collector with P1 Forms component', async ({ page }) => {
  const davinciFlow = '99ccced66a6ad160b48d339c3d219d9c';
  const { navigate } = asyncEvents(page);
  await navigate(`/?clientId=${clientId}&acr_values=${davinciFlow}`);

  await expect(page.url()).toBe(
    `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciFlow}`,
  );

  await expect(page.getByText('Example - Sign On')).toBeVisible();

  const requests: string[] = [];
  let riskData;
  page.on('request', (request) => {
    const method = request.method();
    const requestUrl = request.url();
    const payload = request.postDataJSON();

    requests.push(requestUrl);

    // Only process POST requests with JSON payloads
    if (method === 'POST' && payload && requestUrl.includes('customForm')) {
      const data = payload.parameters?.data?.formData?.deviceRisk;
      if (data) {
        riskData = data;
      }
    }
  });

  const protectPromise = page.waitForRequest(
    (req) =>
      req.method() === 'POST' &&
      req.url().includes('customForm') &&
      req.postDataJSON()?.parameters?.data?.formData?.deviceRisk,
  );
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();
  await protectPromise;

  expect(riskData).toBeDefined();
  expect(riskData).toMatch(/^R\/o\//);
});
