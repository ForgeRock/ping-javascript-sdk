/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { test, expect } from '@playwright/test';
import { pingAmUsername, pingAmPassword } from './utils/demo-users.js';
import { asyncEvents } from './utils/async-events.js';
import { loginPingAm } from './utils/login.js';

// The redirect URI the SDK is configured with for the PingAM app
const REDIRECT_URI = 'http://localhost:8443/ping-am/';

/**
 * Build a minimal, syntactically valid JWT with the given payload.
 * The signature segment is fake — this JWT is only used for nonce/sub validation
 * in tests where the SDK's own logic reads the payload, not a real IdP.
 */
function makeFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${header}.${body}.fakesignature`;
}

test.describe('user.session() tests', () => {
  test('session check (none) succeeds after login', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    // Log in to obtain tokens in storage
    await loginPingAm(page, pingAmUsername, pingAmPassword);

    // Intercept the prompt=none authorize request and redirect back to the redirect URI
    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        await route.fulfill({
          status: 302,
          headers: { Location: REDIRECT_URI },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (none)', exact: true }).click();
    await expect(page.locator('#session-check-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-result').textContent();
    expect(resultText).not.toContain('"error"');
  });

  test('session check (none) fails with login_required', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    // Log in to obtain tokens (id_token_hint requires stored tokens)
    await loginPingAm(page, pingAmUsername, pingAmPassword);

    // Intercept and return an error response
    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        const redirectUri = url.searchParams.get('redirect_uri') ?? REDIRECT_URI;
        await route.fulfill({
          status: 302,
          headers: {
            Location: `${redirectUri}?error=login_required&error_description=User+not+authenticated`,
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (none)', exact: true }).click();
    await expect(page.locator('#session-check-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-result').textContent();
    expect(resultText).toContain('"error": "login_required"');
  });

  test('session check (none) fails when no session exists', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    // Navigate without logging in — no tokens in storage, no browser session
    await navigate('/ping-am/');

    await page.getByRole('button', { name: 'Session Check (none)', exact: true }).click();
    await expect(page.locator('#session-check-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-result').textContent();
    // PingAM returns login_required or interaction_required when there is no session
    expect(resultText).toMatch(/"error": "(login_required|interaction_required)"/);
  });

  test('session check (id_token) succeeds with valid JWT in hash', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    // Log in to obtain tokens
    await loginPingAm(page, pingAmUsername, pingAmPassword);

    // Intercept the prompt=none authorize request; extract nonce and return synthetic JWT
    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        const nonce = url.searchParams.get('nonce') ?? '';
        const state = url.searchParams.get('state') ?? '';
        const redirectUri = url.searchParams.get('redirect_uri') ?? REDIRECT_URI;
        const jwt = makeFakeJwt({ nonce, sub: 'test-user', iat: Math.floor(Date.now() / 1000) });
        await route.fulfill({
          status: 302,
          headers: {
            Location: `${redirectUri}#id_token=${jwt}&state=${state}`,
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (id_token)' }).click();
    await expect(page.locator('#session-check-id-token-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-id-token-result').textContent();
    expect(resultText).toContain('"mode"');
    expect(resultText).toContain('"claims"');
    expect(resultText).not.toContain('"error"');
  });

  test('session check (id_token) fails with login_required', async ({ page }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    // Log in to obtain tokens
    await loginPingAm(page, pingAmUsername, pingAmPassword);

    // Intercept and return an error response
    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        const redirectUri = url.searchParams.get('redirect_uri') ?? REDIRECT_URI;
        await route.fulfill({
          status: 302,
          headers: {
            Location: `${redirectUri}?error=login_required&error_description=Session+expired`,
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (id_token)' }).click();
    await expect(page.locator('#session-check-id-token-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-id-token-result').textContent();
    expect(resultText).toContain('"error": "login_required"');
  });

  test('session check (none) succeeds even when redirect URI has extra query params', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    await loginPingAm(page, pingAmUsername, pingAmPassword);

    // none mode resolves by recognising the redirect URI — extra params on the redirect are allowed
    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        await route.fulfill({
          status: 302,
          headers: {
            Location: `${REDIRECT_URI}?session_state=some-opaque-value`,
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (none)', exact: true }).click();
    await expect(page.locator('#session-check-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-result').textContent();
    expect(resultText).not.toContain('"error"');
  });

  test('session check (id_token) fails with nonce_mismatch when JWT contains wrong nonce', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    await loginPingAm(page, pingAmUsername, pingAmPassword);

    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        const state = url.searchParams.get('state') ?? '';
        const redirectUri = url.searchParams.get('redirect_uri') ?? REDIRECT_URI;
        // JWT has a different nonce than what the SDK generated
        const jwt = makeFakeJwt({ nonce: 'wrong-nonce', sub: 'test-user' });
        await route.fulfill({
          status: 302,
          headers: {
            Location: `${redirectUri}#id_token=${jwt}&state=${state}`,
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (id_token)' }).click();
    await expect(page.locator('#session-check-id-token-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-id-token-result').textContent();
    expect(resultText).toContain('"error": "nonce_mismatch"');
  });

  test('session check (none) fails with iframe_timeout when AS does not respond', async ({
    page,
  }) => {
    const { navigate } = asyncEvents(page);
    await navigate('/ping-am/');

    await loginPingAm(page, pingAmUsername, pingAmPassword);

    // Never fulfill the authorize request — let the iframe time out
    await page.route('**/authorize**', async (route, request) => {
      const url = new URL(request.url());
      if (url.searchParams.get('prompt') === 'none') {
        // intentionally do not call route.fulfill or route.continue
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Session Check (none)', exact: true }).click();
    await expect(page.locator('#session-check-result')).not.toBeEmpty();
    const resultText = await page.locator('#session-check-result').textContent();
    expect(resultText).toContain('"error": "iframe_timeout"');
  });
});
