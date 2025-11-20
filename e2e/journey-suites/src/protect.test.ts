/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

test.describe('PingOne Protect Journey', () => {
  test('should complete journey with Protect initialization and evaluation', async ({ page }) => {
    const { clickButton } = asyncEvents(page);

    const messageArray: string[] = [];

    // Listen for console messages
    page.on('console', async (msg) => {
      messageArray.push(msg.text());
      return Promise.resolve(true);
    });

    // Navigate to PingOne Protect journey
    // Use 'load' instead of 'networkidle' because Protect SDK makes continuous requests
    await page.goto('/?journey=TEST_LoginPingProtect&clientId=basic', { waitUntil: 'load' });

    // Step 1: Wait for Protect initialization to display and complete
    await expect(page.getByText('Initializing PingOne Protect...')).toBeVisible({ timeout: 10000 });

    // Wait for initialization success message
    await expect(page.getByText('PingOne Protect initialized successfully!')).toBeVisible({
      timeout: 15000,
    });

    // Submit the form to proceed to next step
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for the journey to progress
    await page.waitForTimeout(2000);

    // Debug: Print console messages
    console.log('Console messages so far:', messageArray);

    // Step 2: Perform login with username and password
    await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 15000 });
    await page.getByLabel('User Name').fill(username);
    await page.getByLabel('Password').fill(password);

    // Wait a bit to ensure input events have been processed
    await page.waitForTimeout(500);

    await clickButton('Submit', '/authenticate');

    // Step 3: Wait for Protect evaluation to display and complete
    await expect(page.getByText('Evaluating risk assessment...')).toBeVisible({ timeout: 10000 });

    // Wait for evaluation success message
    await expect(page.getByText('Risk assessment completed successfully!')).toBeVisible({
      timeout: 15000,
    });

    // Submit the form to complete the journey
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for the journey to complete
    await page.waitForTimeout(2000);

    // Step 4: Verify journey completion
    await expect(page.getByText('Complete')).toBeVisible({ timeout: 10000 });

    // Verify session token is present
    const sessionToken = await page.locator('#sessionToken').textContent();
    expect(sessionToken).toBeTruthy();

    // Step 5: Perform logout
    await clickButton('Logout', '/authenticate');

    // Verify we're back at the beginning
    await expect(page.getByText('Initializing PingOne Protect...')).toBeVisible({ timeout: 10000 });

    // Test console log assertions
    expect(messageArray.some((msg) => msg.includes('Protect initialized successfully'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Protect data collected successfully'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
  });
});
