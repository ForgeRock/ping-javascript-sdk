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
  await navigate('/?tree=TEST_LoginWithMiscCallbacks&clientId=tenant');

  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  expect(page.url()).toBe(
    'http://localhost:5829/?tree=TEST_LoginWithMiscCallbacks&clientId=tenant',
  );

  // Perform basic login
  await page.getByLabel('User Name').fill(username);
  await clickButton('Submit', '/authenticate');

  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  // Message Node: Are you human?
  await page.getByText('Are you human?').isVisible();
  await page.getByLabel('Yes').click();
  await clickButton('Submit', '/authenticate');

  // Choice Collector: Are you sure?
  await page.getByLabel('Are you sure?').selectOption('Yes');
  await clickButton('Submit', '/authenticate');

  // Choice Collector: Are you sure?
  await page.getByLabel('Are you sure?').selectOption('Yes');
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Please wait while we process your request.')).toBeVisible();
  await page.waitForTimeout(1500); // Simulate wait for async poll
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Complete')).toBeVisible();

  // Perform logout, wait for /authenticate to ensure logout completed and form is refreshed
  await clickButton('Logout', '/authenticate');

  // Test assertions
  expect(messageArray.includes('Journey completed successfully')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
});
