/*
 *
 * Copyright (c) 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
const urlParams = new URLSearchParams(window.location.search);
const journeyParam = urlParams.get('journey');

const AM_BASE = 'https://openam-sdks.forgeblocks.com/am';
const REALM = 'alpha';
const JOURNEY = journeyParam || 'Login';

// Run journey Login to establish an AM session before background auth
export async function runLoginJourney(
  username: string,
  password: string,
  amBase?: string,
): Promise<void> {
  const authenticateUrl = `${amBase || AM_BASE}/json/realms/root/realms/${REALM}/authenticate?authIndexType=service&authIndexValue=${JOURNEY}`;

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
