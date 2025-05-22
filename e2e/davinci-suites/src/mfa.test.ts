/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password } from './utils/demo-user.js';

// TODO: This test is currently failing due to an issue with device registration in the flow.
test.skip('Using ACR Values, lets render an OTP form and submit the request', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate(
    '/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_value=22eb75b5d31d371afe089d6e4a824f5c',
  );

  expect(page.url()).toBe(
    'http://localhost:5829/?clientId=20dd0ed0-bb9b-4c8f-9a60-9ebeb4b348e0&acr_value=22eb75b5d31d371afe089d6e4a824f5c',
  );

  await page.getByLabel('Email Address').fill('mfauser+' + Date.now() + '@user.com');
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Placeholder').fill('12345678901');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.getByRole('button', { name: 'Text Message' }).click();

  await page.waitForEvent('requestfinished');

  await page.getByText('MFA - Enter Phone Number');

  await page.getByLabel('Country Code').selectOption('United States (1)');
  await page.getByLabel('Enter Phone Number').fill('12345678901');

  const request = page.waitForRequest((request) =>
    request.url().endsWith('/capabilities/customForm?next=true'),
  );
  await page.getByRole('button', { name: 'Submit' }).click();
  const posted = await request;
  const postedData = JSON.parse(posted.postData());
  const data = postedData.parameters.data;
  expect(data).toEqual({
    actionKey: 'submit',
    formData: {
      countryCode: '1',
      phoneNumber: '12345678901',
    },
  });
});
