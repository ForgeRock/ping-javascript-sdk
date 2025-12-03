/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test device profile collection journey flow', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);

  const messageArray: string[] = [];

  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  await navigate('/?journey=DeviceProfileCallbackTest&clientId=basic');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 10000 });
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Collecting device profile information...')).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText('Device profile collected successfully!')).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByText('Complete')).toBeVisible({ timeout: 15000 });

  await clickButton('Logout', '/authenticate');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 10000 });

  expect(messageArray.some((msg) => msg.includes('Device profile collected successfully'))).toBe(
    true,
  );
  expect(messageArray.some((msg) => msg.includes('Journey completed successfully'))).toBe(true);
  expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
});
