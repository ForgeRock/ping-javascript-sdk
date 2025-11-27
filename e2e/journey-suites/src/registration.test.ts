/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password } from './utils/demo-user.js';

test('Test happy paths on test page', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  await navigate('/?journey=Registration&clientId=tenant');

  // generate ID, 3 sections of random numbers: "714524572-2799534390-3707617532"
  const id = globalThis.crypto.getRandomValues(new Uint32Array(3)).join('-');
  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  expect(page.url()).toBe('http://localhost:5829/?journey=Registration&clientId=tenant');

  // Perform registration
  await page.getByLabel('Username').fill('testuser+' + id);

  // Select email and fill with "testuser+<id>@example.com"
  await page.getByLabel('Email Address').fill('testuser+' + id + '@example.com');
  // Select first name and fill with "Sally"
  await page.getByLabel('First Name').fill('Sally');
  // Select last name and fill with "Tester"
  await page.getByLabel('Last Name').fill('Tester');
  // Select "Send me special offers and services" and leave check
  await page.getByLabel('Send me special offers and services').check();
  // Select "Send me news and updates" and uncheck
  await page.getByLabel('Send me news and updates').check();
  // Fill password
  await page.getByLabel('Password').fill(password);

  // Select "Select a security question 7" dropdown and choose custom question
  await page.getByLabel('Select a security question 7').selectOption('user-defined');
  await page.getByLabel('Type your question 7:').fill(`What is your pet's name?`);
  // Fill answer with "Rover"
  await page.getByLabel('Answer 7').fill('Rover');

  // Select "Select a security question 8" dropdown and choose "Who was your first employer?"
  await page
    .getByLabel('Select a security question 8')
    .selectOption('Who was your first employer?');
  // Fill answer with "Pizza"
  await page.getByLabel('Answer 8').fill('AAA Engineering');

  await page.getByLabel('I accept the terms and conditions').check();

  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Complete')).toBeVisible();

  // Perform logout
  await clickButton('Logout', '/authenticate');

  // Test assertions
  expect(messageArray.includes(`Custom question 7: What is your pet's name?`)).toBe(true);
  expect(messageArray.includes('Answer 7: Rover')).toBe(true);
  expect(messageArray.includes(`Selected question 8: Who was your first employer?`)).toBe(true);
  expect(messageArray.includes('Answer 8: AAA Engineering')).toBe(true);
  expect(messageArray.includes('Journey completed successfully')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
});
