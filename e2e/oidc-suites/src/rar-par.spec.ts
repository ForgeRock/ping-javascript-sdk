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

async function rarParFlow(buttonName: string, page: Page) {
  const { clickWithRedirect } = asyncEvents(page);

  await page.getByRole('button', { name: buttonName }).click();

  // Token renewal doesn't automatically redirect on interaction errors so click the link manually
  if (buttonName === 'Renew Tokens') {
    await page.getByRole('link', { name: 'Redirect Link' }).click();
  }

  if (buttonName !== 'Login (Background — PAR + RAR)') {
    await expect(await page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Next' }).click();
  }

  await page.getByRole('heading', { name: 'Consent Request' }).click();
  expect(page.getByText(JSON.stringify(authorizationDetails))).toBeDefined();
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('heading', { name: 'Consent Response' }).click();
  expect(page.getByText(JSON.stringify(authorizationDetails))).toBeDefined();
  const tokenResponsePromise = page.waitForResponse('**/access_token');
  await clickWithRedirect('Continue', 'http://localhost:8443/rar-par/**');

  expect(page.url()).toContain('http://localhost:8443/rar-par');
  expect(page.url()).toContain('code=');
  expect(page.url()).toContain('state=');
  await expect(page.locator('#accessToken-0')).not.toBeEmpty();

  const response = await tokenResponsePromise;
  const tokenResponse = await response.json();
  await expect(tokenResponse?.authorization_details).toEqual(authorizationDetails);
}

test.describe('Rich Authorization Request (RAR) tests with PAR', () => {
  test('redirect-based auth with RAR + PAR obtains access token', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/rar-par/');
    await rarParFlow('Login (Redirect — PAR + RAR)', page);
  });

  test('background auth with RAR + PAR obtains access token', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/rar-par/');

    await page.getByRole('textbox', { name: 'User Name' }).fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await page.getByRole('button', { name: 'Login (Journey)' }).click();
    await expect(page.getByText('Session established')).toBeVisible();

    await rarParFlow('Login (Background — PAR + RAR)', page);
  });

  test('token renewal with RAR + PAR obtains access token', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/rar-par/');
    await rarParFlow('Renew Tokens', page);
  });
});
