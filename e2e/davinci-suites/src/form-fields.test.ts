/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';

test('Should render form fields', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/?clientId=e4ef2896-8d90-4abd-bf0f-7b8034995927');

  await expect(page.getByText('Select Form Fields Test Form')).toBeVisible();
  await page.getByRole('button', { name: 'Form Fields' }).click();

  await expect(page.getByText('Form Fields Test')).toBeVisible();
  await page.getByRole('textbox', { name: 'Text Input Label' }).fill('The input');

  await page.locator('#checkbox-field-key-1').check();
  await page.locator('#checkbox-field-key-2').check();

  await page.locator('#dropdown-field-key').selectOption('dropdown-option1-value');
  await page.locator('#dropdown-field-key').selectOption('dropdown-option2-value');

  await page.locator('#radio-group-key').selectOption('option2 label');

  await page.locator('#combobox-field-key-1').check();
  await page.locator('#combobox-field-key-2').check();
  await page.locator('#combobox-field-key-3').check();
  await page.locator('#combobox-field-key-2').uncheck();

  await page.locator('#phone-number-input-1').fill('1234567890');
  await page.locator('#extension-input-1').fill('7890');

  // Rich text should render a link
  await expect(page.getByRole('link', { name: 'Ping Identity' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ping Identity' })).toHaveAttribute(
    'href',
    'https://www.pingidentity.com',
  );

  // Agreement title and content should be visible
  await expect(page.getByRole('heading', { name: 'Terms of Service Agreement' })).toBeVisible();
  await expect(
    page.getByText(
      'This is example agreement text, you can edit this text in the agreements section.',
    ),
  ).toBeVisible();

  // Single checkbox default value
  await expect(page.locator('#single-checkbox-field')).not.toBeChecked();

  // Single checkbox rich text
  await expect(page.getByText('I agree to the Terms and Conditions')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terms and Conditions' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute(
    'href',
    'https://www.pingidentity.com',
  );

  // Toggle the single checkbox and assert that it is optional by the absence of an error message
  await page.locator('#single-checkbox-field').check();
  await expect(page.locator('#single-checkbox-field')).toBeChecked();
  await page.locator('#single-checkbox-field').uncheck();
  await expect(page.locator('#single-checkbox-field')).not.toBeChecked();
  await expect(page.locator('.single-checkbox-field-error')).not.toBeAttached();

  await expect(page.getByRole('button', { name: 'Flow Button' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Flow Link' })).toBeVisible();

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('customForm') && request.method() === 'POST',
  );

  await page.getByRole('button', { name: 'Submit' }).click();
  const request = await requestPromise;
  const postData = request.postData();
  const parsedData = postData ? JSON.parse(postData) : {};
  const data = parsedData.parameters.data;

  expect(data.actionKey).toBe('submit');
  expect(data.formData).toStrictEqual({
    'text-input-key': 'The input',
    'checkbox-field-key': ['option1 value', 'option2 value'],
    'dropdown-field-key': 'dropdown-option2-value',
    'radio-group-key': 'option2 value',
    'combobox-field-key': ['option1 value', 'option3 value'],
    'phone-field': {
      phoneNumber: '1234567890',
      countryCode: 'GB',
      extension: '7890', // Tests PhoneNumberExtensionCollector
    },
    'single-checkbox-field': false,
  });
});

test('should render form validation fields', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/?clientId=e4ef2896-8d90-4abd-bf0f-7b8034995927');

  await expect(page.getByText('Select Form Fields Test Form')).toBeVisible();

  await page.getByRole('button', { name: 'Form Validation' }).click();

  await expect(page.getByText('Form Fields Validation')).toBeVisible();

  await page.getByRole('textbox', { name: 'Username' }).fill('@#$');
  await expect(page.getByText('Must be alphanumeric')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email Address' }).fill('abc');
  await expect(page.getByText('Not a valid email')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email Address' }).fill('abc@email.com');
  await expect(page.getByText('Not a valid email')).not.toBeVisible();

  // Toggle the single checkbox to assert error message
  await page.locator('#single-checkbox-field').check();
  await page.locator('#single-checkbox-field').uncheck();
  await expect(page.getByText('Select the checkbox to continue.')).toBeVisible();
});
