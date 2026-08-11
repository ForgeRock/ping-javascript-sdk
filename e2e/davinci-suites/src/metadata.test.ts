/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test.describe('Metadata Collector', () => {
  const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
  const davinciPolicy = '7793be21a14dd80c1d26b367e81ea985';

  test('should submit with success status when metadata collection succeeds', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await page.getByRole('button', { name: 'Sign On' }).click();
    await expect(page.getByRole('button', { name: 'Metadata Success' })).toBeVisible();

    await page.getByRole('button', { name: 'Metadata Success' }).click();

    await expect(page.getByRole('heading', { name: 'Message' })).toBeVisible();
    await expect(page.getByText('"status":"succeeded"')).toBeVisible();
  });

  test('should submit with error details when metadata collection fails', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await page.getByRole('button', { name: 'Sign On' }).click();
    await expect(page.getByRole('button', { name: 'Metadata Error' })).toBeVisible();

    await page.getByRole('button', { name: 'Metadata Error' }).click();

    await expect(page.getByRole('heading', { name: 'Message' })).toBeVisible();
    await expect(page.getByText('"code":"ERROR_CODE"')).toBeVisible();
    await expect(page.getByText('"message":"Operation cancelled"')).toBeVisible();
  });
});
