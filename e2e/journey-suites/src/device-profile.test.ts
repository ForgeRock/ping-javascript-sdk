/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test('Test device profile collection journey flow', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  const messageArray: string[] = [];
  let deviceProfileRequestBody: Record<string, unknown> | null = null;

  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  page.on('request', (request) => {
    if (request.url().includes('/authenticate') && request.method() === 'POST') {
      try {
        const postData = request.postData();
        if (!postData) return;

        const body = JSON.parse(postData);
        const deviceCallback = body.callbacks?.find(
          (cb: { type: string }) => cb.type === 'DeviceProfileCallback',
        );
        if (!deviceCallback) return;

        const profileInput = deviceCallback.input?.find(
          (input: { name: string }) => input.name === 'IDToken1',
        );
        if (profileInput?.value) {
          deviceProfileRequestBody = JSON.parse(profileInput.value);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  });

  await navigate('/?journey=DeviceProfileCallbackTest&clientId=basic');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 10000 });
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  await expect(page.getByText('Collecting device profile information...')).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText('Device profile collected successfully!')).toBeVisible({
    timeout: 15000,
  });

  await expect(page.getByText('Complete')).toBeVisible({ timeout: 15000 });

  expect(deviceProfileRequestBody).not.toBeNull();
  expect(deviceProfileRequestBody).toHaveProperty('identifier');
  expect(typeof deviceProfileRequestBody?.identifier).toBe('string');
  expect((deviceProfileRequestBody?.identifier as string).length).toBeGreaterThan(0);

  expect(deviceProfileRequestBody).toHaveProperty('metadata');
  const metadata = deviceProfileRequestBody?.metadata as Record<string, unknown>;
  expect(metadata).toHaveProperty('hardware');
  expect(metadata).toHaveProperty('browser');
  expect(metadata).toHaveProperty('platform');

  const platform = metadata.platform as Record<string, unknown>;
  expect(platform).toHaveProperty('deviceName');
  expect(typeof platform.deviceName).toBe('string');

  await clickButton('Logout', '/sessions');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 10000 });

  expect(messageArray.some((msg) => msg.includes('Device profile collected successfully'))).toBe(
    true,
  );
  expect(messageArray.some((msg) => msg.includes('Journey completed successfully'))).toBe(true);
  expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
});
