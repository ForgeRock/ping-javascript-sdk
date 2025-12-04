/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test QR Code journey flow using QRCode module', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  const messageArray: string[] = [];

  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  await navigate('/?journey=QRCodeTest');

  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.locator('#qr-code-container')).toBeVisible({ timeout: 10000 });

  await expect(page.locator('#qr-code-message')).toBeVisible();
  const messageText = await page.locator('#qr-code-message').textContent();
  expect(messageText).toContain('Scan the QR code');

  await expect(page.locator('#qr-code-uri')).toBeVisible();
  const uriText = await page.locator('#qr-code-uri').textContent();
  expect(uriText).toContain('otpauth://');
  expect(uriText).toContain('secret=');

  await expect(page.locator('#qr-code-use-type')).toBeVisible();
  const useTypeText = await page.locator('#qr-code-use-type').textContent();
  expect(useTypeText).toContain('Type: otp');

  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Complete')).toBeVisible();

  await clickButton('Logout', '/sessions');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 10000 });

  expect(messageArray.some((msg) => msg.includes('QR Code step detected via QRCode module'))).toBe(
    true,
  );
  expect(messageArray.some((msg) => msg.includes('QR Code data:'))).toBe(true);
  expect(messageArray.some((msg) => msg.includes('Journey completed successfully'))).toBe(true);
  expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
});
