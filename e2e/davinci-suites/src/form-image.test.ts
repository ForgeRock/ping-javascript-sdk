/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';

test('Should render image collector in form', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');

  await expect(page.getByText('Select Test Form')).toBeVisible();
  await page.getByRole('button', { name: 'Form Fields' }).click();

  await expect(page.getByText('Form Fields Tests')).toBeVisible();

  const formImage = page.getByTestId('form-image');
  await expect(formImage).toBeVisible();
  await expect(formImage).toHaveAttribute('src', /QC-Montreal-Skyline_hero\.jpg/);
  await expect(formImage).toHaveAttribute('alt', 'New Image');

  const formImageAnchor = page.locator('a:has([data-testid="form-image"])');
  await expect(formImageAnchor).toHaveAttribute('href', 'https://www.pingidentity.com/en.html');
});
