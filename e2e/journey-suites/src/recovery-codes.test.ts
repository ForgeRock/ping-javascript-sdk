/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test.describe('Recovery Codes Journey', () => {
  test('should display recovery codes using RecoveryCodes module and complete journey', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);
    const messageArray: string[] = [];

    page.on('console', async (msg) => {
      messageArray.push(msg.text());
      return Promise.resolve(true);
    });

    await navigate('/?journey=TEST_WebAuthnWithRecoveryCodes');

    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: 10000 });
    await clickButton('Submit', '/authenticate');

    await expect(page.locator('#recovery-codes-container')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('#recovery-codes-header')).toBeVisible();
    const headerText = await page.locator('#recovery-codes-header').textContent();
    expect(headerText).toContain('Recovery Codes');

    await expect(page.locator('#recovery-codes-list')).toBeVisible();

    const codeElements = page.locator('.recovery-code');
    const codeCount = await codeElements.count();
    expect(codeCount).toBeGreaterThan(0);

    const firstCode = await codeElements.first().textContent();
    expect(firstCode).toBeTruthy();
    expect(firstCode?.length).toBeGreaterThan(0);

    await expect(page.getByText('I have saved my recovery codes')).toBeVisible();

    await clickButton('Submit', '/authenticate');

    await expect(page.getByText('Complete')).toBeVisible({ timeout: 10000 });

    const sessionToken = await page.locator('#sessionToken').textContent();
    expect(sessionToken).toBeTruthy();

    await clickButton('Logout', '/sessions');

    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: 10000 });

    expect(
      messageArray.some((msg) =>
        msg.includes('Recovery Codes step detected via RecoveryCodes module'),
      ),
    ).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Recovery codes:'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Journey completed successfully'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
  });
});
