/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@forgerock/e2e-shared/coverage-fixture';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test middleware on test page', async ({ page }) => {
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
    networkArray.push(req.url().toString());
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

  // Test URL query parameters added to URL on networkArray
  const startRequest = networkArray.find((url) => url.includes('start-authenticate-middleware'));
  const nextRequest = networkArray.find((url) => url.includes('authenticate-middleware'));
  const endRequest = networkArray.find((url) => url.includes('end-session-middleware'));

  expect(startRequest?.includes('start-authenticate-middleware=start-authentication')).toBeTruthy();
  expect(nextRequest?.includes('authenticate-middleware=authentication')).toBeTruthy();
  expect(endRequest?.includes('end-session-middleware=end-session')).toBeTruthy();

  // Check for addition of custom headers
  const startHeader = headerArray.find((headers) => headers.get('x-start-authenticate-middleware'));
  const nextHeader = headerArray.find((headers) => headers.get('x-authenticate-middleware'));
  const endHeader = headerArray.find((headers) => headers.get('x-end-session-middleware'));

  expect(startHeader?.get('x-start-authenticate-middleware')).toBe('start-authentication');
  expect(nextHeader?.get('x-authenticate-middleware')).toBe('authentication');
  expect(endHeader?.get('x-end-session-middleware')).toBe('end-session');

  // Check that Accept-Language header was modified from default en-US locale and set to correct value in each middleware
  expect(startHeader?.get('Accept-Language')).not.toContain('en-US');
  expect(nextHeader?.get('Accept-Language')).not.toContain('en-US');
  expect(endHeader?.get('Accept-Language')).not.toContain('en-US');

  expect(startHeader?.get('Accept-Language')).toBe('xx-XX');
  expect(nextHeader?.get('Accept-Language')).toBe('yy-YY');
  expect(endHeader?.get('Accept-Language')).toBe('zz-ZZ');

  expect(messageArray.includes('Journey completed successfully')).toBe(true);
  expect(messageArray.includes('Logout successful')).toBe(true);
});
