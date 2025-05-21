/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test('Test debug log level and custom logger functions', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  await navigate('/?logFn=true');

  expect(page.url()).toBe('http://localhost:5829/?logFn=true');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  await expect(page.getByText('Complete')).toBeVisible();

  // Just test if the custom debug function is called
  expect(
    messageArray.includes('[DEBUG] This is a custom logger function output.'),
    'Custom debug function output string should be present',
  ).toBe(true);
});

test('Test log level without custom logger', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  await navigate('/');

  expect(page.url()).toBe('http://localhost:5829/');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  await expect(page.getByText('Complete')).toBeVisible();

  messageArray.forEach((msg) => {
    // Ensure a debug message is present, but don't check the whole contents
    if (msg.includes('DaVinci API Request')) {
      expect(msg).toContain('DaVinci API Response');
    }
  });
});
