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
  await navigate('/?tree=TEST_LoginSuspendEmail&clientId=tenant');

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

  await expect(
    page.getByText(
      'An email has been sent to the address you entered. Click the link in that email to proceed.',
    ),
  ).toBeVisible();
});
