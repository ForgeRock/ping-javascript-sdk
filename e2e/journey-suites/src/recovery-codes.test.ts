/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test.describe('Recovery Codes Journey', () => {
  test('should display recovery codes after WebAuthn registration and complete journey', async ({
    page,
  }) => {
    const { clickButton, navigate } = asyncEvents(page);

    const messageArray: string[] = [];

    // Listen for console messages
    page.on('console', async (msg) => {
      messageArray.push(msg.text());
      return Promise.resolve(true);
    });

    // Navigate to WebAuthn with Recovery Codes test journey
    await navigate('/?journey=TEST_WebAuthnWithRecoveryCodes');

    // Step 1: WebAuthn registration step
    // The UI renders MetadataCallback (invisible) and HiddenValueCallback (hidden input)
    // Wait for the Submit button to be visible (indicates callbacks have rendered)
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: 10000 });

    // Submit the WebAuthn registration step
    // In e2e testing, the mock API accepts this without actual WebAuthn validation
    await clickButton('Submit', '/authenticate');

    // Step 2: Recovery Codes display step
    // Should show the TextOutputCallback with recovery codes
    // and a ConfirmationCallback with radio button option
    await expect(page.getByText('I have saved my recovery codes')).toBeVisible({ timeout: 10000 });

    // Click Submit to acknowledge recovery codes (radio option is selected by default)
    await clickButton('Submit', '/authenticate');

    // Step 3: Verify journey completion
    await expect(page.getByText('Complete')).toBeVisible({ timeout: 10000 });

    // Verify session token is present
    const sessionToken = await page.locator('#sessionToken').textContent();
    expect(sessionToken).toBeTruthy();

    // Step 4: Perform logout
    await clickButton('Logout', '/authenticate');

    // Verify we're back at the beginning
    await page.waitForTimeout(1000);

    // Test console log assertions
    expect(messageArray.some((msg) => msg.includes('Journey completed successfully'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Logout successful'))).toBe(true);
  });
});
