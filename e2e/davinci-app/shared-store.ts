/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Shared-store smoke test entry point.
 *
 * This page is navigated to by the Playwright e2e suite
 * `shared-store.test.ts` only. It does not connect to any real PingOne
 * endpoint — the test intercepts every `.well-known` request via
 * `page.route()` and returns a minimal synthetic response.
 *
 * The page reports results by writing to `#status` so the test can
 * assert via `page.textContent` without any app-specific UI.
 */
import { davinci } from '@forgerock/davinci-client';
import type { DaVinciConfig } from '@forgerock/davinci-client/types';
import { oidc } from '@forgerock/oidc-client';
import type { OidcConfig } from '@forgerock/oidc-client/types';

const WELLKNOWN_URL = 'https://sdk-test.example.com/as/.well-known/openid-configuration';

const davinciConfig: DaVinciConfig = {
  clientId: 'test-davinci-client',
  redirectUri: window.location.origin,
  scope: 'openid profile',
  serverConfig: { wellknown: WELLKNOWN_URL },
};

const oidcConfig: OidcConfig = {
  clientId: 'test-oidc-client',
  redirectUri: window.location.origin,
  scope: 'openid profile',
  responseType: 'code',
  serverConfig: { wellknown: WELLKNOWN_URL },
};

const statusEl = document.getElementById('status')!;

async function run() {
  // ── Mode 2: davinci creates the store, oidc attaches ─────────────────────
  const dvClient = await davinci({ config: davinciConfig });
  if ('error' in dvClient) {
    statusEl.textContent = `davinci init error: ${dvClient.error}`;
    return;
  }

  const ocClient = await oidc({ config: oidcConfig, store: dvClient.store });
  if ('error' in ocClient) {
    statusEl.textContent = `oidc init error: ${ocClient.error}`;
    return;
  }

  statusEl.textContent = 'ready';
}

run().catch((err) => {
  statusEl.textContent = `unexpected error: ${String(err)}`;
});
