/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { password } from './utils/demo-user.js';

test.describe('Device registration tests', () => {
  const username = 'fakeemail@user.com';
  const clientId = '9c1d9655-7d1b-46f3-a96d-345690259d2a';
  const policyId = '4b6008f10ba174dd3ce3ab60c5b81d7e';

  test.afterEach(async ({ page }) => {
    await page.goto(`/?clientId=${clientId}&acr_values=${policyId}`);

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.getByRole('button', { name: 'USER_DELETE' }).click();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
  });

  test('Login - add email device - authenticate with email device', async ({ page }) => {
    /** Go to page */
    await page.goto(`/?clientId=${clientId}&acr_values=${policyId}`);

    expect(page.url()).toContain(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${policyId}`,
    );
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();

    /**
     * Register a new user
     */
    await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();

    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('heading', { name: 'Registration Complete' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();

    /***
     * Login with the new user
     **/
    await page.goto(`/?clientId=${clientId}&acr_values=${policyId}`);
    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await expect(page.getByText('SDK Automation - Sign On')).toBeVisible();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    /** Register a device */
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();
    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await expect(page.getByText('MFA Device Selection - Registration')).toBeVisible();
    await page.getByRole('button', { name: 'Email' }).click();
    await page
      .getByRole('textbox', { name: 'Email Address' })
      .fill('test+my_fake_user@example.com');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('EMAIL MFA Registered')).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
  });

  test('Login - add phone device - authenticate with phone device', async ({ page }) => {
    /** Go to page */
    await page.goto(`/?clientId=${clientId}&acr_values=${policyId}`);
    expect(page.url()).toContain(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${policyId}`,
    );

    /**
     * Register a new user
     **/
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();
    await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('heading', { name: 'Registration Complete' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();

    /**
     * Login with the new user
     **/
    await page.goto(`/?clientId=${clientId}&acr_values=${policyId}`);
    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await expect(page.getByText('SDK Automation - Sign On')).toBeVisible();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    /** Register a Device */
    await expect(page.getByText('FIDO2 Test Form')).toBeVisible();
    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await expect(page.getByText('MFA Device Selection - Registration')).toBeVisible();
    await page.getByRole('button', { name: 'Text Message' }).click();
    await expect(page.getByText('SDK Automation - Standard Phone Number')).toBeVisible();
    await page.getByLabel('Country Code').selectOption('US');
    await page.getByRole('textbox', { name: 'Enter Phone Number' }).fill('3035550100');
    await expect(page.getByText('Extension')).not.toBeVisible(); // Tests standard PhoneNumberCollector
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('SMS/Voice MFA Registered')).toBeVisible();

    await page.getByRole('button', { name: 'Continue' }).click();
  });
});
