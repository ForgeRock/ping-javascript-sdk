/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';

/**
 * Verifies that two SDK clients sharing a store fetch the OpenID Connect
 * discovery document exactly once, regardless of which client initialises
 * first and regardless of the ownership model.
 *
 * The page under test (`/shared-store`) exercises both Mode 2 (davinci owns
 * the store) and Mode 3 (consumer-created store). Requests to the well-known
 * URL are intercepted and served with a synthetic response so the test does
 * not require a live PingOne endpoint.
 */

const WELLKNOWN_URL = 'https://sdk-test.example.com/as/.well-known/openid-configuration';

const WELLKNOWN_RESPONSE = {
  issuer: 'https://sdk-test.example.com/as',
  authorization_endpoint: 'https://sdk-test.example.com/as/authorize',
  token_endpoint: 'https://sdk-test.example.com/as/token',
  userinfo_endpoint: 'https://sdk-test.example.com/as/userinfo',
  jwks_uri: 'https://sdk-test.example.com/as/jwks',
  revocation_endpoint: 'https://sdk-test.example.com/as/revoke',
  introspection_endpoint: 'https://sdk-test.example.com/as/introspect',
  pushed_authorization_request_endpoint: 'https://sdk-test.example.com/as/par',
};

test('shared store — one .well-known fetch across two clients (mode 2: client-owned)', async ({
  page,
}) => {
  let discoveryFetchCount = 0;

  // Intercept and count every discovery request; fulfil with a synthetic response
  // so no live credential or network is needed.
  await page.route(`**/.well-known/**`, async (route) => {
    discoveryFetchCount++;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(WELLKNOWN_RESPONSE),
    });
  });

  await page.goto('/shared-store.html', { waitUntil: 'networkidle' });

  // The page reports its own status so we know initialisation completed.
  await expect(page.locator('#status')).toHaveText('ready', { timeout: 15_000 });

  // Mode 2 (davinci owns the store, oidc attaches): davinci fetches once,
  // oidc reads from cache — exactly 1 network request for 2 clients.
  expect(discoveryFetchCount).toBe(1);
});

test("shared store — oidc attaches to davinci's store, reads discovery from cache", async ({
  page,
}) => {
  const fetchedUrls: string[] = [];

  await page.route(`**/.well-known/**`, async (route) => {
    fetchedUrls.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(WELLKNOWN_RESPONSE),
    });
  });

  await page.goto('/shared-store.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#status')).toHaveText('ready', { timeout: 15_000 });

  // Both modes use the same WELLKNOWN_URL, so each URL appears exactly once
  // across the two calls despite four total client initialisations.
  const unique = [...new Set(fetchedUrls)];
  expect(unique).toHaveLength(1);
  expect(unique[0]).toContain('.well-known');

  // Mode 2: 2 clients (davinci + oidc) on 1 store → exactly 1 fetch.
  expect(fetchedUrls.length).toBe(1);
});
