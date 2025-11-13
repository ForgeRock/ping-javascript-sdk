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
  await navigate('/?journey=TEST_OTPRegistration&clientId=tenant');

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

  await expect(() => expect(page.getByText('Scan the QR code')).toBeVisible()).toPass();

  // Test assertions
  expect(
    messageArray.includes(
      'Scan the QR code image below with the ForgeRock Authenticator app to register your device with your login.',
    ),
  ).toBe(true);

  // TODO: Use when AM Mock API is available
  // expect(
  //   messageArray.includes(
  //     'otpauth://totp/ForgeRock:jlowery?secret=QITSTC234FRIU8DD987DW3VPICFY======&issuer=ForgeRock&period=30&digits=6&b=032b75',
  //   ),
  // ).toBe(true);
  // expect(messageArray.includes('Basic login with OTP registration step successful')).toBe(true);
});
