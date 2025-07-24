/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { password } from './utils/demo-user.js';

test('Login - add email device - authenticate with email device', async ({ page }) => {
  /** Go to page */
  await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

  expect(page.url()).toContain(
    'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e',
  );
  /**
   * Register a new user
   */
  await page.goto('http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
  await expect(page.getByRole('button', { name: 'USER_REGISTRATION' })).toBeVisible();
  await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('fakeemail@user.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('U.QPDWEN47ZMyJhCDmhGLK*nr');
  await page.getByRole('textbox', { name: 'Given Name' }).fill('demouser');
  await page.getByRole('textbox', { name: 'Family Name' }).fill('demouser');
  expect(await page.getByRole('button', { name: 'Continue' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Registration Complete' })).toBeVisible();
  await page.getByRole('button').click();
  await page.getByRole('button', { name: 'Logout' }).click();
  /***
   * Login with the new user
   **/
  await page.goto('http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
  await page.getByRole('button', { name: 'USER_LOGIN' }).click();
  await page.getByText('SDK Automation - Sign On');
  await page.getByRole('textbox', { name: 'Username' }).fill('fakeemail@user.com');
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign On' }).click();

  /** Register a device */
  await page.getByText('Select Test Form');
  await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
  await page.getByText('SDK Automation - Device Registration');
  await page.getByRole('button', { name: 'Email' }).click();
  await page.getByText('SDK Automation - Device Registration');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('test+my_fake_user@example.com');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('EMAIL MFA Registered')).toBeVisible();
  await page.getByRole('button').click();

  /** Authenticate with the Device */
  await page.getByRole('button', { name: 'DEVICE_AUTHENTICATION' }).click();
  await page.getByText('SDK Automation - Device Authentication');
  await page.getByRole('button', { name: 'Email' }).click();
  await page.getByRole('button', { name: 'USER_DELETE' }).click();
  await page.getByRole('heading', { name: 'Success' });
  await page.getByRole('button', { name: 'Start over' }).click();
});
test('Login - add phone device - authenticate with phone device', async ({ page }) => {
  await page.goto('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
  /***
   * Go to page
   ***/
  expect(page.url()).toContain(
    'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0',
  );

  /**
   * Register a new user
   **/
  await page.goto('http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');
  await expect(page.getByRole('button', { name: 'USER_REGISTRATION' })).toBeVisible();
  await page.getByRole('button', { name: 'USER_REGISTRATION' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('fakeemail2@user.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('U.QPDWEN47ZMyJhCDmhGLK*nr');
  await page.getByRole('textbox', { name: 'Given Name' }).fill('demouser');
  await page.getByRole('textbox', { name: 'Family Name' }).fill('demouser');
  expect(await page.getByRole('button', { name: 'Continue' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Registration Complete' })).toBeVisible();
  await page.getByRole('button').click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.goto('http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

  /**
   * Login with the new user
   **/
  await page.getByRole('button', { name: 'USER_LOGIN' }).click();
  await page.getByText('SDK Automation - Sign On');
  await page.getByRole('textbox', { name: 'Username' }).fill('fakeemail2@user.com');
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign On' }).click();

  /** Register a Device */
  await page.getByText('Select Test Form');
  await page.getByRole('button', { name: 'DEVICE_REGISTRATION' }).click();
  await page.getByText('SDK Automation - Device Registration');
  await page.getByRole('button', { name: 'Text Message' }).click();
  await expect(page.getByText('SDK Automation - Enter Phone Number')).toBeVisible();
  await expect(page.locator('#countryCode')).toBeVisible();
  await page.locator('#countryCode').selectOption('1');
  await page.getByRole('textbox', { name: 'Enter Phone Number' }).fill('3035550100');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('SMS/Voice MFA Registered')).toBeVisible();
  await page.getByRole('button').click();

  /** Authenticate with the Device */
  await page.getByRole('button', { name: 'DEVICE_AUTHENTICATION' }).click();
  await page.getByText('SDK Automation - Device Authentication');
  await page.getByRole('button', { name: 'Text Message' }).click();
  await page.getByRole('button', { name: 'USER_DELETE' }).click();
  await page.getByRole('heading', { name: 'Success' });
  await page.getByRole('button', { name: 'Start over' }).click();
});
