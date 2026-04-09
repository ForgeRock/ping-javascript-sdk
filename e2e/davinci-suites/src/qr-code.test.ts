/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

const qrCodeUrl =
  '/?clientId=c12743f9-08e8-4420-a624-71bbb08e9fe1&acr_values=9da1b93991bcd577947da228ad4c741f';

test('QR code renders after navigating through device registration flow', async ({ page }) => {
  const { navigate } = asyncEvents(page);

  await navigate(qrCodeUrl);

  // Step 1: Login
  await page.getByRole('button', { name: 'USER_LOGIN' }).click();
  await page.waitForEvent('requestfinished');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign On' }).click();
  await page.waitForEvent('requestfinished');

  // Step 2: Select device registration
  await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
  await page.waitForEvent('requestfinished');

  // Step 3: Choose "Mobile App" from the device selection screen
  await expect(page.getByText('MFA Device Selection - Registration')).toBeVisible();
  await page.getByRole('button', { name: 'Mobile App' }).click();
  await page.waitForEvent('requestfinished');

  // Step 4: QR code should now be visible
  const qrImage = page.locator('[data-testid="qr-code-image"]');
  await expect(qrImage).toBeVisible({ timeout: 10000 });

  // Verify the image has a base64-encoded src
  const src = await qrImage.getAttribute('src');
  expect(src).toBeTruthy();
  expect(src).toContain('data:image/png;base64,');

  // Verify fallback text is displayed if present
  const fallback = page.locator('[data-testid="qr-code-fallback"]');
  const fallbackVisible = await fallback.isVisible();
  if (fallbackVisible) {
    const fallbackText = await fallback.textContent();
    expect(fallbackText).toBeTruthy();
  }
});
