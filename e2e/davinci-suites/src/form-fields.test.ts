/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';

test('Should render form fields', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');

  await expect(page.getByText('Select Test Form')).toBeVisible();
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

  await page.locator('#phone-number-input').fill('1234567890');

  await expect(page.getByRole('button', { name: 'Flow Button' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Flow Link' })).toBeVisible();

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('customForm') && request.method() === 'POST',
  );

  await page.getByRole('button', { name: 'Submit' }).click();
  const request = await requestPromise;

  const parsedData = JSON.parse(request.postData());
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
    },
  });
});

test('should render form validation fields', async ({ page }) => {
  await page.goto('http://localhost:5829/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');

  await expect(page.getByText('Select Test Form')).toBeVisible();

  await page.getByRole('button', { name: 'Form Validation' }).click();

  await expect(page.getByText('Form Fields Validation')).toBeVisible();

  await page.getByRole('textbox', { name: 'Username' }).fill('@#$');
  await expect(page.getByText('Must be alphanumeric')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email Address' }).fill('abc');
  await expect(page.getByText('Not a valid email')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email Address' }).fill('abc@email.com');
  await expect(page.getByText('Not a valid email')).not.toBeVisible();
});
