/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test.skip('Test happy paths on test page', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  await navigate('/?middleware=true&journey=Login');

  const headerArray: Headers[] = [];
  const messageArray: string[] = [];
  const networkArray: string[] = [];

  // Listen for events on page
  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  page.on('request', async (req) => {
    networkArray.push(`${new URL(req.url()).pathname}, ${req.resourceType()}`);
  });

  page.on('request', async (req) => {
    const headers = req.headers();

    headerArray.push(new Headers(headers));
  });

  expect(page.url()).toBe('http://localhost:5829/?middleware=true&journey=Login');

  // Perform basic login
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Complete')).toBeVisible();

  // Perform logout
  await clickButton('Logout', '/authenticate');

  // Test assertions
  // test URL query parameters added to URL on networkArray

  expect(networkArray).toContain('start-authenticate-middleware, fetch');
  expect(networkArray).toContain('authenticate-middleware, fetch');
  expect(networkArray).toContain('end-session-middleware, fetch');

  expect(
    headerArray.find((headers) => headers.get('x-start-authenticate-middleware')),
  ).toBeTruthy();
  expect(headerArray.find((headers) => headers.get('x-authenticate-middleware'))).toBeTruthy();
  expect(headerArray.find((headers) => headers.get('x-end-session-middleware'))).toBeTruthy();

  expect(messageArray.includes('Journey completed successfully')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
});
