/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test PingOne Protect journey flow', async ({ page }) => {
  const { clickButton } = asyncEvents(page);

  const messageArray: string[] = [];

  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  await page.goto('/?journey=TEST_LoginPingProtect&clientId=basic', { waitUntil: 'load' });

  await expect(page.getByText('Initializing PingOne Protect...')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('PingOne Protect initialized successfully!')).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 15000 });
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Evaluating risk assessment...')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Risk assessment completed successfully!')).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByText('Complete')).toBeVisible({ timeout: 15000 });

  await clickButton('Logout', '/authenticate');

  await expect(page.getByText('Initializing PingOne Protect...')).toBeVisible({ timeout: 10000 });

  expect(messageArray.some((msg) => msg.includes('Protect initialized successfully'))).toBe(true);
  expect(messageArray.some((msg) => msg.includes('Protect data collected successfully'))).toBe(
    true,
  );
  expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
});
