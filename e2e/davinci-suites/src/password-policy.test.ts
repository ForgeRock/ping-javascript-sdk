/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password } from './utils/demo-user.js';

/**
 * DaVinci flow: Andy - MFA Device Registration/Authentication (PingOne Forms)
 * Client ID: fb456db5-2e08-46d3-adf0-05bf8d26ad60
 * Flow ID (acr_values): 769eecb92f8e66f88005a85e8b939a01
 * Wellknown: https://auth.pingone.ca/356a254c-cba3-4ade-be1a-860136e8df01/as/.well-known/openid-configuration
 */
const CLIENT_ID = 'fb456db5-2e08-46d3-adf0-05bf8d26ad60';
const FLOW_ID = '769eecb92f8e66f88005a85e8b939a01';

/**
 * A unique email per test run to avoid conflicts with existing accounts.
 * The USER_DELETE cleanup step removes the account regardless.
 */
function uniqueEmail() {
  return `pwpolicy+${Date.now()}@user.com`;
}

async function navigateToRegistration(page: Parameters<typeof asyncEvents>[0]) {
  const { navigate } = asyncEvents(page);
  await navigate(`/?clientId=${CLIENT_ID}&acr_values=${FLOW_ID}`);

  // Wait for flow buttons to render (they have class 'flow-link')
  await page.waitForSelector('button.flow-link', { timeout: 10000 });

  // Click USER_REGISTRATION button
  await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();

  /**
   * The registration form is the PingOne Forms 'Example - Registration 1' form.
   * It renders: heading 'Example - Registration 1', username, email, password +
   * requirements list, verify password, and a Submit button.
   */
  await expect(page.getByRole('heading', { name: /Example - Registration/i })).toBeVisible({
    timeout: 10000,
  });
}

async function deleteTestUser(page: Parameters<typeof asyncEvents>[0], email: string) {
  await page.goto(`/?clientId=${CLIENT_ID}&acr_values=${FLOW_ID}`);

  // Wait for flow buttons to render
  await page.waitForSelector('button.flow-link', { timeout: 10000 });

  // Click USER_LOGIN button
  await page.getByRole('button', { name: 'USER_LOGIN' }).click();

  // Fill login credentials
  await page.getByRole('textbox', { name: /Username/i }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign On' }).click();

  // Wait for next set of flow buttons (delete option)
  await page.waitForSelector('button.flow-link', { timeout: 10000 });

  // Click USER_DELETE button
  await page.getByRole('button', { name: 'USER_DELETE' }).click();

  await expect(page.getByRole('heading', { name: /Success/i })).toBeVisible();
}

test.describe('ValidatedPasswordCollector — password policy (Example - Registration form)', () => {
  let createdEmail: string | null = null;

  test.afterEach(async ({ page }) => {
    if (createdEmail) {
      const email = createdEmail;
      createdEmail = null;
      try {
        await deleteTestUser(page, email);
      } catch (err) {
        console.error(`[cleanup] Failed to delete test user ${email}:`, err);
      }
    }
  });

  test('renders password requirements list from the PingOne password policy', async ({ page }) => {
    await navigateToRegistration(page);

    /**
     * The SDK maps the PASSWORD_VERIFY field (with showPasswordRequirements=true)
     * to a ValidatedPasswordCollector. passwordComponent renders a
     * <ul class="password-requirements"> with one <li> per policy rule.
     *
     * The field key is 'user.password', so:
     *   dotToCamelCase('user.password') => 'userPassword'
     *   input id => #userPassword
     */
    await expect(page.locator('.password-requirements')).toBeVisible();
    const items = page.locator('.password-requirements li');
    expect(await items.count()).toBeGreaterThan(0);
  });

  test('validate() shows inline errors when password is too short', async ({ page }) => {
    await navigateToRegistration(page);

    // A single character will trigger the length rule violation
    await page.locator('#userPassword').fill('a');

    /**
     * passwordComponent creates a <ul class="{key}-error"> when validate()
     * returns errors. For field key 'user.password' that is class 'userPassword-error'.
     */
    await expect(page.locator('.userPassword-error')).toBeVisible();
    const errors = page.locator('.userPassword-error li');
    expect(await errors.count()).toBeGreaterThan(0);
  });

  test('validate() clears errors once all password policy requirements are satisfied', async ({
    page,
  }) => {
    await navigateToRegistration(page);

    // Trigger an error first
    await page.locator('#userPassword').fill('a');
    await expect(page.locator('.userPassword-error')).toBeVisible();

    /**
     * The existing demo password satisfies any reasonable PingOne password
     * policy: it is long, contains uppercase (D), digits, and a special char (@).
     */
    await page.locator('#userPassword').fill(password);
    await expect(page.locator('.userPassword-error')).not.toBeAttached();
  });

  test('submits registration form successfully with a policy-compliant password', async ({
    page,
  }) => {
    createdEmail = uniqueEmail();
    const email = createdEmail;

    await navigateToRegistration(page);

    // Fill all required fields
    await page.locator('#userUsername').fill(email);
    await page.locator('#userEmail').fill(email);
    await page.locator('#userPassword').fill(password);

    // Submit the form by calling submit() on the form element
    await page.locator('form').evaluate((form: HTMLFormElement) => form.submit());

    // Wait for the page to navigate to the next step
    // The heading should change from "Example - Registration 1" to something else
    await page.waitForFunction(
      () => {
        const heading = document.querySelector('h2');
        return heading && !heading.textContent?.includes('Example - Registration');
      },
      { timeout: 10000 },
    );

    // Verify we've moved to the next step
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();

    // If the flow shows a "Continue" button, click through to complete it
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }
  });
});
