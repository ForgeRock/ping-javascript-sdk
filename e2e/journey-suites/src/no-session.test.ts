/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test happy paths on test page', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  await navigate('/?tree=Login&no-session=true');

  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  expect(page.url()).toBe('http://localhost:5829/?tree=Login&no-session=true');

  // Perform basic login
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Complete')).toBeVisible();

  // Test assertions
  await expect(messageArray.includes('Session Token: none')).toBe(true);
});
