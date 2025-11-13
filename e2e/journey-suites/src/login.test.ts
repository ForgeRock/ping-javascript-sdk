/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test('Test happy paths on test page', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  await navigate('/?journey=Login');

  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  // Perform basic login
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Complete')).toBeVisible();

  // Perform logout
  await clickButton('Logout', '/authenticate');

  // Test assertions
  expect(messageArray.includes('Journey completed successfully')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
});
