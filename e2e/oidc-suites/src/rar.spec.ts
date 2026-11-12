/*
 *
 * Copyright 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { expect, test } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';
import { pingAmPassword, pingAmUsername } from './utils/demo-users.js';

import type { Page } from '@playwright/test';

const authorizationDetails = [
  {
    type: 'account_information',
    actions: ['list_accounts', 'read_balances'],
    locations: ['https://example.com/accounts'],
    datatypes: ['balances'],
  },
];

async function rarFlow(buttonName: string, page: Page) {
  const { navigate, clickWithRedirect } = asyncEvents(page);

  await navigate('/rar/');

  await page.getByRole('button', { name: buttonName }).click();

  // Token renewal doesn't automatically redirect on interaction errors so click the link manually
  if (buttonName === 'Renew Tokens') {
    await page.getByRole('link', { name: 'Redirect Link' }).click();
  }

  await page.getByLabel('User Name').fill(pingAmUsername);
  await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('heading', { name: 'Consent Request' }).click();
  expect(page.getByText(JSON.stringify(authorizationDetails))).toBeDefined();
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('heading', { name: 'Consent Response' }).click();
  expect(page.getByText(JSON.stringify(authorizationDetails))).toBeDefined();
  const tokenResponsePromise = page.waitForResponse('**/access_token');
  await clickWithRedirect('Continue', 'http://localhost:8443/rar/**');

  expect(page.url()).toContain('http://localhost:8443/rar');
  expect(page.url()).toContain('code=');
  expect(page.url()).toContain('state=');
  await expect(page.locator('#accessToken-0')).not.toBeEmpty();

  const response = await tokenResponsePromise;
  const tokenResponse = await response.json();
  await expect(tokenResponse?.authorization_details).toEqual(authorizationDetails);
}

test.describe('Rich Authorization Request (RAR) tests (no PAR)', () => {
  test('redirect-based auth with RAR obtains access token', async ({ page }) => {
    await rarFlow('Login (Redirect)', page);
  });

  test('background auth with RAR obtains access token', async ({ page }) => {
    await rarFlow('Login (Background)', page);
  });

  test('token renewal with RAR obtains access token', async ({ page }) => {
    await rarFlow('Renew Tokens', page);
  });
});
