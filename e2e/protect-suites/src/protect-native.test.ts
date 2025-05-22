/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { expect, test } from '@playwright/test';
import { password, username } from './utils/demo-user.js';

test.describe('Test basic login flow with Ping Protect', () => {
  test.afterEach(({ page }) => {
    page.removeListener('console', (msg) => console.log(msg.text()));
  });

  test('should send Protect data and login successfully', async ({ page }) => {
    const logs = [];
    page.on('console', async (msg) => {
      logs.push(msg.text());
      return Promise.resolve(true);
    });

    await page.goto('/protect-native');
    await expect(page.url()).toBe('http://localhost:8443/protect-native');

    await expect(page.getByText('Protect initializing')).toBeVisible();

    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Protect evaluating')).toBeVisible();

    await expect(page.getByText('Your user information:')).toBeVisible();
    await expect(page.getByText('sdkuser@example.com')).toBeVisible();

    await expect(logs.includes('protect initialized')).toBeTruthy();
    await expect(logs.includes('protect evaluating')).toBeTruthy();
    await expect(logs.includes('received data')).toBeTruthy();
    await expect(logs.includes('set data on evaluation callback')).toBeTruthy();
  });
});
