/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test('Test middleware on test page', async ({ page }) => {
  const networkArray = [];
  page.on('request', async (req) => {
    const url = req.url().toString();
    const langHeader = await req.headerValue('Accept-Language');
    if (url.includes('https://auth.pingone.ca')) {
      networkArray.push({ url, langHeader });
    }
  });

  const { navigate } = asyncEvents(page);
  await navigate('/');

  expect(page.url()).toBe('http://localhost:5829/');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  await expect(page.getByText('Complete')).toBeVisible();

  const startRequest = networkArray.find((req) => req.url.includes('/authorize'));
  const nextRequest = networkArray.find((req) => req.url.includes('/customHTMLTemplate'));

  // Check for addition of query params
  await expect(startRequest.url.includes('start=true')).toBeTruthy();
  await expect(startRequest.url.includes('next=true')).toBeFalsy();
  await expect(nextRequest.url.includes('next=true')).toBeTruthy();
  await expect(nextRequest.url.includes('start=true')).toBeFalsy();

  // Check that Accept-Language header was modified from default en-US locale
  await expect(startRequest.langHeader).not.toContain('en-US');
  await expect(startRequest.langHeader).toBe('xx-XX');
  await expect(nextRequest.langHeader).not.toContain('en-US');
  await expect(nextRequest.langHeader).toBe('zz-ZZ');
});
