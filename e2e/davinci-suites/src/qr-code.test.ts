/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

const clientId = 'e4ef2896-8d90-4abd-bf0f-7b8034995927';
const policyId = 'b6c0b61b1c7697f9fcfb013d05e8f977';
const qrCodeUrl = `/?clientId=${clientId}&acr_values=${policyId}`;

test('QR code renders on screen', async ({ page }) => {
  const { navigate } = asyncEvents(page);

  await navigate(qrCodeUrl);

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
