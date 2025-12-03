/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test QR Code journey flow', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);

  const messageArray: string[] = [];

  // Listen for console messages
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  // Navigate to QR Code test journey
  await navigate('/?journey=QRCodeTest');

  // Step 1: Perform basic login
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  // Step 2: QR Code step should be displayed with instruction message
  await expect(page.getByText('Scan the QR code image below', { exact: false })).toBeVisible({
    timeout: 10000,
  });

  // Step 3: The "Next" radio button is already selected by default
  // Click Submit to proceed with the confirmation
  await clickButton('Submit', '/authenticate');

  // Step 4: Verify journey completion
  await expect(page.getByText('Complete')).toBeVisible();

  // Step 5: Perform logout
  await clickButton('Logout', '/authenticate');

  // Test assertions
  expect(messageArray.includes('Journey completed successfully')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
});
