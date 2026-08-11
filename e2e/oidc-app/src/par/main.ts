/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { oidcApp } from '../utils/oidc-app.js';

const AM_BASE = 'https://openam-sdks.forgeblocks.com/am';
const REALM = 'alpha';

const urlParams = new URLSearchParams(window.location.search);
const wellknown = urlParams.get('wellknown');

const config = {
  clientId: 'ParClient',
  redirectUri: 'http://localhost:8443/par/',
  scope: 'openid profile email',
  par: true,
  serverConfig: {
    wellknown:
      wellknown ||
      'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
  },
};

// Run journey Login to establish an AM session before background PAR auth
async function runLoginJourney(username: string, password: string): Promise<void> {
  const authenticateUrl = `${AM_BASE}/json/realms/root/realms/${REALM}/authenticate?authIndexType=service&authIndexValue=Login`;

  // Step 1: start the journey
  const initRes = await fetch(authenticateUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'Accept-API-Version': 'resource=2.1' },
    body: '{}',
  });
  const initJson = await initRes.json();

  if (initJson.successUrl) return; // already authenticated

  // Fill NameCallback + PasswordCallback
  for (const cb of initJson.callbacks ?? []) {
    if (cb.type === 'NameCallback') cb.input[0].value = username;
    if (cb.type === 'PasswordCallback') cb.input[0].value = password;
  }

  // Step 2: submit credentials
  const submitRes = await fetch(authenticateUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'Accept-API-Version': 'resource=2.1' },
    body: JSON.stringify(initJson),
  });
  const submitJson = await submitRes.json();

  if (!submitJson.tokenId && !submitJson.successUrl) {
    throw new Error(submitJson.message || 'Login failed');
  }
}

const journeyForm = document.getElementById('journey-form') as HTMLFormElement;
const journeyStatus = document.getElementById('journey-status') as HTMLParagraphElement;
const backgroundBtn = document.getElementById('login-background') as HTMLButtonElement;

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
