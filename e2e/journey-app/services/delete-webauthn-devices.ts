/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { deviceClient } from '@forgerock/device-client';
import type { WebAuthnDevice } from '@forgerock/device-client/types';
import { JourneyClientConfig } from '@forgerock/journey-client/types';

/**
 * Derives the AM base URL from an OIDC well-known URL.
 *
 * Example: `https://example.com/am/oauth2/alpha/.well-known/openid-configuration`
 * becomes `https://example.com/am`.
 *
 * @param wellknown The OIDC well-known URL.
 * @returns The base URL for AM (origin + path prefix before `/oauth2/`).
 */
function getBaseUrlFromWellknown(wellknown: string): string {
  const parsed = new URL(wellknown);
  const [pathWithoutOauth] = parsed.pathname.split('/oauth2/');
  return `${parsed.origin}${pathWithoutOauth}`;
}

/**
 * Derives the realm URL path from an OIDC well-known URL.
 *
 * Example: `/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration`
 * becomes `realms/root/realms/alpha`.
 */
function getRealmUrlPathFromWellknown(wellknown: string): string {
  const parsed = new URL(wellknown);
  const [, afterOauth] = parsed.pathname.split('/oauth2/');
  if (!afterOauth) {
    return 'realms/root';
  }

  const suffix = '/.well-known/openid-configuration';
  const realmUrlPath = afterOauth.endsWith(suffix)
    ? afterOauth.slice(0, -suffix.length)
    : afterOauth.replace(/\/.well-known\/openid-configuration\/?$/, '');

  return realmUrlPath.replace(/^\/+/, '').replace(/\/+$/, '') || 'realms/root';
}

/**
 * Retrieves the AM user id from the session cookie using `idFromSession`.
 *
 * Note: This relies on the browser sending the session cookie; callers should use
 * `credentials: 'include'` and ensure AM CORS allows credentialed requests.
 */
async function getUserIdFromSession(baseUrl: string, realmUrlPath: string): Promise<string | null> {
  const url = `${baseUrl}/json/${realmUrlPath}/users?_action=idFromSession`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-API-Version': 'protocol=2.1,resource=3.0',
      },
    });

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      return null;
    }

    const id = (data as Record<string, unknown>).id;
    return typeof id === 'string' && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

/**
 * Deletes a single WebAuthn device by matching its `credentialId`.
 *
 * This queries devices via device-client and deletes the matching device.
 */
export async function deleteWebAuthnDevice(
  config: JourneyClientConfig,
  credentialId: string | null,
): Promise<string> {
  if (!credentialId) {
    return 'No credential id found. Register a WebAuthn device first.';
  }

  const wellknown = config.serverConfig.wellknown;
  const baseUrl = getBaseUrlFromWellknown(wellknown);
  const realmUrlPath = getRealmUrlPathFromWellknown(wellknown);
  const userId = await getUserIdFromSession(baseUrl, realmUrlPath);

  if (!userId) {
    throw new Error('Failed to retrieve user id from session. Are you logged in?');
  }

  const realm = realmUrlPath.replace(/^realms\//, '') || 'root';
  const webAuthnClient = deviceClient({
    realmPath: realm,
    serverConfig: {
      baseUrl,
    },
  });

  const devices = await webAuthnClient.webAuthn.get({ userId });
  if (!Array.isArray(devices)) {
    throw new Error(`Failed to retrieve devices: ${String(devices.error)}`);
  }

  const device = (devices as WebAuthnDevice[]).find((d) => d.credentialId === credentialId);
  if (!device) {
    return `No WebAuthn device found matching credential id: ${credentialId}`;
  }

  const response = await webAuthnClient.webAuthn.delete({
    userId,
    device,
  });

  if (response && typeof response === 'object' && 'error' in response) {
    const error = (response as { error?: unknown }).error;
    throw new Error(`Failed deleting device ${device.uuid}: ${String(error)}`);
  }

  return `Deleted WebAuthn device ${device.uuid} with credential id ${credentialId} for user ${userId}.`;
}
