/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test('Test happy paths on test page', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/');

  const messageArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  expect(page.url()).toBe('http://localhost:5829/');

  // Perform basic login
  await page.getByLabel('User Name').fill('demouser');
  await page.getByLabel('Password').fill('U.QPDWEN47ZMyJhCDmhGLK*nr');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Complete')).toBeVisible();

  // Perform logout
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

  // Test assertions
  expect(messageArray.includes('Basic login successful')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
  expect(messageArray.includes('Starting authentication with service')).toBe(true);
  expect(messageArray.includes('Continuing authentication with service')).toBe(true);
});
