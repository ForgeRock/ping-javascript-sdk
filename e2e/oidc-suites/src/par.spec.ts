/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { expect, test } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';
import { pingAmPassword, pingAmUsername } from './utils/demo-users.js';

async function loginJourney(page, username: string, password: string) {
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login (Journey)' }).click();
  await expect(page.locator('#journey-status')).toContainText('Session established');
}

// Synthetic PAR error endpoint — intercepted by Playwright before any real network call
const SYNTHETIC_PAR_ERROR_URL = 'http://localhost:8443/synthetic-par-error-endpoint';
// The real wellknown used by the PAR app (intercepted to inject the synthetic PAR endpoint)
const DEFAULT_WELLKNOWN_PATTERN =
  '**/openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration*';

test.describe('PAR (Pushed Authorization Request) login tests', () => {
  test('PAR authorize returns 400 error — SDK surfaces error to the UI without redirecting', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);

    // Intercept the wellknown to inject our synthetic PAR endpoint URL
    await page.route(DEFAULT_WELLKNOWN_PATTERN, async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...json,
          pushed_authorization_request_endpoint: SYNTHETIC_PAR_ERROR_URL,
        }),
      });
    });

    // Intercept the synthetic PAR endpoint and return a 400 error
    await page.route(SYNTHETIC_PAR_ERROR_URL, (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_request',
          error_description: 'Missing required PAR parameter',
        }),
      });
    });

    await navigate('/par/');

    // Clicking redirect login triggers PAR → receives 400 → SDK should surface an error
    await page.getByRole('button', { name: /^Login \(Redirect\b/ }).click();

    // The SDK should surface an error in the UI instead of redirecting away
    await expect(page.locator('.error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error')).toContainText('PAR_ERROR');
  });

  test('background login with PAR enabled (ParClient) obtains access token', async ({ page }) => {
    const { navigate } = asyncEvents(page);

    const parRequests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/par')) {
        parRequests.push(request.url());
      }
    });

    await navigate('/par/');

    // Establish AM session via the Login journey before attempting background PAR auth
    await loginJourney(page, pingAmUsername, pingAmPassword);

    // Background button is now enabled — click and wait for the iframe to return a code
    await page.getByRole('button', { name: /^Login \(Background\b/ }).click();
    await expect(page.locator('#accessToken-0')).not.toBeEmpty();

    // PAR POST was made for the background request
    expect(parRequests.length).toBeGreaterThan(0);
  });

  test('redirect login with PAR enabled (ParClient) obtains access token and uses slim authorize URL', async ({
    page,
  }) => {
    const { clickWithRedirect, navigate } = asyncEvents(page);

    const parRequests: string[] = [];
    const parAuthorizeUrls: string[] = [];

    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/par')) {
        parRequests.push(request.url());
      }
      // Capture the slim PAR authorize redirect — has request_uri, not scope
      if (request.url().includes('/authorize') && request.url().includes('request_uri=')) {
        parAuthorizeUrls.push(request.url());
      }
    });

    await navigate('/par/');

    await clickWithRedirect(/^Login \(Redirect\b/, '**/am/XUI/**');

    await page.getByLabel('User Name').fill(pingAmUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(pingAmPassword);
    await clickWithRedirect('Next', 'http://localhost:8443/par/**');

    expect(page.url()).toContain('code');
    expect(page.url()).toContain('state');

    await expect(page.locator('#accessToken-0')).not.toBeEmpty();

    // PAR POST was made
    expect(parRequests.length).toBeGreaterThan(0);

    // Slim authorize URL contains only client_id + request_uri (not scope/code_challenge)
    expect(parAuthorizeUrls.length).toBeGreaterThan(0);
    const authorizeUrl = new URL(parAuthorizeUrls[0]);
    expect(authorizeUrl.searchParams.has('client_id')).toBe(true);
    expect(authorizeUrl.searchParams.has('request_uri')).toBe(true);
    expect(authorizeUrl.searchParams.has('scope')).toBe(false);
    expect(authorizeUrl.searchParams.has('code_challenge')).toBe(false);
    expect(authorizeUrl.searchParams.has('redirect_uri')).toBe(false);
  });
});
