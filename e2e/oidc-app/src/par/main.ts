/*
 *
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { runLoginJourney } from '../utils/journey-login.js';
import { oidcApp } from '../utils/oidc-app.js';

const urlParams = new URLSearchParams(window.location.search);
const AM_BASE = 'https://openam-sdks.forgeblocks.com/am';

const config = {
  clientId: 'ParClient',
  redirectUri: 'http://localhost:8443/par/',
  scope: 'openid profile email',
  par: true,
  serverConfig: {
    wellknown: `${AM_BASE}/oauth2/alpha/.well-known/openid-configuration`,
  },
};

const journeyForm = document.getElementById('journey-form') as HTMLFormElement;
const journeyStatus = document.getElementById('journey-status') as HTMLParagraphElement;
const backgroundBtn = document.getElementById('login-background') as HTMLButtonElement;

// Run journey Login to establish an AM session before background PAR auth
journeyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = (document.getElementById('username') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  journeyStatus.textContent = 'Logging in…';
  try {
    await runLoginJourney(username, password);
    journeyStatus.textContent = '✓ Session established — background login now available.';
    backgroundBtn.disabled = false;
  } catch (err) {
    journeyStatus.textContent = `✗ ${err instanceof Error ? err.message : 'Login failed'}`;
  }
});

oidcApp({ config, urlParams });
