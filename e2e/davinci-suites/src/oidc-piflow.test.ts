/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test('oidc background authorize with pi.flow uses fetch and yields tokens', async ({ page }) => {
  // Capture authorize requests: the fetch-based pi.flow branch issues a POST
  // to the authorization endpoint, while the iframe-based branch navigates a
  // child frame with a plain GET.
  const authorizeRequests: { method: string; url: string }[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/as/authorize')) {
      authorizeRequests.push({
        method: request.method(),
        url,
      });
    }
  });

  const { navigate } = asyncEvents(page);
  await navigate('/?piFlow=true');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  // Successful flow renders the Complete panel; the app reaches for the
  // oidc client's background authorize (pi.flow branch) to obtain code/state
  await expect(page.getByText('Complete')).toBeVisible();

  // The background authorize must have taken the fetch branch: a POST to
  // the authorization endpoint (the iframe branch issues GET requests only).
  const fetchAuthorize = authorizeRequests.find((req) => req.method === 'POST');
  if (!fetchAuthorize) {
    throw new Error('Expected a fetch-based (POST) authorize request');
  }
  expect(new URL(fetchAuthorize.url).searchParams.get('response_mode')).toBe('pi.flow');

  // The DaVinci start authorize (GET, response_mode=pi.flow) also flows
  // through this page; ensure it was not the only authorize seen.
  expect(authorizeRequests.length).toBeGreaterThanOrEqual(2);

  const authCode = await page.locator('#authCode').innerText();
  expect(authCode).toBeTruthy();

  await page.getByText('Get Tokens').click();

  const accessToken = await page.locator('#accessTokenValue').innerText();
  expect(accessToken).toBeTruthy();
});
