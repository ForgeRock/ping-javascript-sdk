/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { password } from './utils/demo-user.js';

test.describe('Device registration tests', () => {
  const username = 'fakeemail@user.com';

  test.afterEach(async ({ page }) => {
    await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    await page.getByRole('button', { name: 'USER_DELETE' }).click();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
  });

  test('Login - add email device - authenticate with email device', async ({ page }) => {
    /** Go to page */
    await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

    expect(page.url()).toContain(
      'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e',
    );
    await expect(page.getByText('Select Test Form')).toBeVisible();

    /**
     * Register a new user
     */
    await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('textbox', { name: 'Given Name' }).fill('demouser');
    await page.getByRole('textbox', { name: 'Family Name' }).fill('demouser');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Registration Complete' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();

    /***
     * Login with the new user
     **/
    await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await expect(page.getByText('SDK Automation - Sign On')).toBeVisible();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    /** Register a device */
    await expect(page.getByText('Select Test Form')).toBeVisible();
    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await expect(page.getByText('SDK Automation - Device Registration')).toBeVisible();
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
    await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
    expect(page.url()).toContain(
      'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0',
    );

    /**
     * Register a new user
     **/
    await expect(page.getByText('Select Test Form')).toBeVisible();
    await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('textbox', { name: 'Given Name' }).fill('demouser');
    await page.getByRole('textbox', { name: 'Family Name' }).fill('demouser');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Registration Complete' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();

    /**
     * Login with the new user
     **/
    await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
    await page.getByRole('button', { name: 'USER_LOGIN' }).click();
    await expect(page.getByText('SDK Automation - Sign On')).toBeVisible();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign On' }).click();

    /** Register a Device */
    await expect(page.getByText('Select Test Form')).toBeVisible();
    await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
    await expect(page.getByText('SDK Automation - Device Registration')).toBeVisible();
    await page.getByRole('button', { name: 'Text Message' }).click();
    await expect(page.getByText('SDK Automation - Enter Phone Number')).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter Phone Number' }).fill('3035550100');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(
      async () => await expect(page.getByText('SMS/Voice MFA Registered')).toBeVisible(),
    ).toPass();
    await page.getByRole('button', { name: 'Continue' }).click();
  });
});
