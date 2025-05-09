/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
//
test('Test happy paths on test page', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate(
    '/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_value=93928296ac55765e57e30b99da8ddabe',
  );

  expect(page.url()).toBe('http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

  await expect(page.getByText('Create Your Profile')).toBeVisible();

  await page.getByLabel('Email Address').fill('test@test.com');
  await page.getByLabel('Password').fill('apassword');
  await page.getByLabel('Placeholder').fill('12345678901');

  const requestPromise = page.waitForRequest((request) =>
    request
      .url()
      .includes(
        'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/8209285e0d2f3fc76bfd23fd10d45e6f/capabilities/customForm?next=true',
      ),
  );

  await page.getByRole('button', { name: 'Submit' }).click();

  const request = await requestPromise;
  const postedData = JSON.parse(request.postData());
  const data = postedData.parameters.data;
  expect(data).toEqual({
    actionKey: 'submit',
    formData: {
      'user.email': 'test@test.com',
      'user.password': 'apassword',
      'phone-field': { phoneNumber: '12345678901', countryCode: 'CA' },
    },
  });
});
test('should validate that phone number is sent correctly in the outgoing response', async ({
  page,
}) => {
  const { navigate } = asyncEvents(page);
  await navigate('/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

  expect(page.url()).toBe('http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0');

  await expect(page.getByText('Create Your Profile')).toBeVisible();

  await page.getByLabel('Email Address').fill('test@test.com');
  await page.getByLabel('Password').fill('apassword');
  await page.getByLabel('Placeholder').fill('12345678901');

  const requestPromise = page.waitForRequest((request) =>
    request
      .url()
      .includes(
        'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/davinci/connections/8209285e0d2f3fc76bfd23fd10d45e6f/capabilities/customForm?next=true',
      ),
  );

  await page.getByRole('button', { name: 'Submit' }).click();

  const request = await requestPromise;
  const postedData = JSON.parse(request.postData());
  const data = postedData.parameters.data;
  expect(data).toEqual({
    actionKey: 'submit',
    formData: {
      'user.email': 'test@test.com',
      'user.password': 'apassword',
      'phone-field': { phoneNumber: '12345678901', countryCode: 'CA' },
    },
  });
});
