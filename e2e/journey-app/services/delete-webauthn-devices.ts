/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { deviceClient } from '@forgerock/device-client';
import { oidc } from '@forgerock/oidc-client';

import type { WebAuthnDevice, DeviceClient } from '@forgerock/device-client/types';
import type {
  GenericError,
  OauthTokens,
  OidcClient,
  OidcConfig,
  UserInfoResponse,
} from '@forgerock/oidc-client/types';

const WEBAUTHN_DEVICES_KEY = 'journey-app:webauthn-device-uuids';

/**
 * Reads the stored WebAuthn device UUIDs from `localStorage`.
 *
 * @returns A `Set` of UUID strings when present; otherwise `null`.
 * @throws When the stored value exists but is not a JSON array.
 */
function getStoredDevices(): Set<string> | null {
  const retrievedDevices = window.localStorage.getItem(WEBAUTHN_DEVICES_KEY);
  if (!retrievedDevices) {
    return null;
  }

  const parsedDevices = JSON.parse(retrievedDevices) as unknown;
  if (!Array.isArray(parsedDevices)) {
    throw new Error('Invalid data in localStorage');
  }

  return new Set(
    parsedDevices.filter((value): value is string => typeof value === 'string' && value.length > 0),
  );
}

/**
 * Creates a redirect URI for OIDC based on the current page origin and path.
 *
 * Note: This intentionally excludes query parameters so temporary values like
 * `code` and `state` can be removed cleanly after token exchange.
 *
 * @returns The redirect URI string (origin + pathname).
 */
function getRedirectUri() {
  const currentUrl = new URL(window.location.href);
  return `${currentUrl.origin}${currentUrl.pathname}`;
}

/**
 * Derive the realm value used by device-client endpoints from a well-known URL.
 *
 * @param wellknown The OIDC well-known URL.
 * @returns The derived realm path to use with device-client (defaults to `root`).
 */
function getRealmPathFromWellknown(wellknown: string): string {
  const pathname = new URL(wellknown).pathname;
  const match = pathname.match(/\/realms\/([^/]+)\/\.well-known\/openid-configuration\/?$/);
  return match?.[1] ?? 'root';
}

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
 * Type guard to detect error-shaped responses returned by SDK helpers.
 *
 * @param value The unknown value to inspect.
 * @returns `true` when the object contains an `error` property.
 */
function hasError(value: unknown): value is { error: string } {
  return Boolean(value && typeof value === 'object' && 'error' in value);
}

/**
 * Retrieves usable OIDC tokens for the current browser session.
 *
 * This will:
 * - exchange an authorization code (`code` + `state`) when present in the URL
 * - otherwise retrieve/renew tokens via the OIDC client
 * - redirect the browser when the token API returns a `redirectUrl`
 *
 * @param oidcClient An initialized OIDC client instance.
 * @param config OIDC configuration used to initiate the authorization flow.
 * @returns Tokens on success; otherwise an `{ error }` object.
 */
async function getOidcTokens(
  oidcClient: OidcClient,
  config: OidcConfig,
): Promise<OauthTokens | { error: string }> {
  if (hasError(oidcClient)) {
    return { error: oidcClient.error };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (code && state) {
    const exchanged = await oidcClient.token.exchange(code, state);
    if (hasError(exchanged)) {
      return { error: exchanged.error };
    }

    const cleanedUrl = new URL(window.location.href);
    cleanedUrl.searchParams.delete('code');
    cleanedUrl.searchParams.delete('state');
    window.history.replaceState({}, document.title, cleanedUrl.toString());

    return exchanged;
  }

  const tokens = await oidcClient.token.get({
    backgroundRenew: true,
    authorizeOptions: {
      clientId: config.clientId,
      redirectUri: getRedirectUri(),
      scope: config.scope,
      responseType: config.responseType ?? 'code',
      responseMode: 'query',
    },
  });

  if (hasError(tokens)) {
    if ('redirectUrl' in tokens && typeof tokens.redirectUrl === 'string') {
      window.location.assign(tokens.redirectUrl);
    }
    return { error: tokens.error };
  }

  return tokens;
}

/**
 * Retrieves the UUID (`sub`) for the currently authenticated user.
 *
 * @param oidcClient An initialized OIDC client instance.
 * @returns The user UUID string on success; otherwise an `{ error }` object.
 */
async function getCurrentUserUuid(oidcClient: OidcClient): Promise<string | { error: string }> {
  if (hasError(oidcClient)) {
    return { error: oidcClient.error };
  }

  const userInfo = (await oidcClient.user.info()) as GenericError | UserInfoResponse;

  if (hasError(userInfo)) {
    return { error: userInfo.error };
  }

  return userInfo.sub;
}

/**
 * Fetches the current user's WebAuthn devices using the device-client SDK.
 *
 * @param config OIDC configuration used to initialize the OIDC client.
 * @returns The user UUID, resolved realm, a configured device-client instance, and the devices list.
 * @throws When token retrieval fails or device retrieval returns an error shape.
 */
async function getWebAuthnDevicesForCurrentUser(config: OidcConfig): Promise<{
  userId: string;
  realm: string;
  webAuthnClient: DeviceClient;
  devices: WebAuthnDevice[];
}> {
  const oidcConfig = { ...config, redirectUri: getRedirectUri() };
  const oidcClient = await oidc({ config: oidcConfig });
  const tokens = await getOidcTokens(oidcClient, config);

  if (hasError(tokens)) {
    throw new Error(`OIDC token retrieval failed: ${String(tokens.error)}`);
  }

  const userId = await getCurrentUserUuid(oidcClient);
  if (typeof userId !== 'string') {
    throw new Error(`Failed to retrieve user UUID: ${String(userId.error)}`);
  }

  const wellknown = config.serverConfig.wellknown;
  const realm = getRealmPathFromWellknown(wellknown);
  const baseUrl = getBaseUrlFromWellknown(wellknown);
  const webAuthnClient = deviceClient({
    realmPath: realm,
    serverConfig: {
      baseUrl,
    },
  });
  const devices = await webAuthnClient.webAuthn.get({
    userId,
  });

  if (!Array.isArray(devices)) {
    throw new Error(`Failed to retrieve devices: ${String(devices.error)}`);
  }

  return { userId, realm, webAuthnClient, devices: devices as WebAuthnDevice[] };
}

/**
 * Stores the current set of registered WebAuthn device UUIDs in `localStorage`.
 *
 * If devices have already been stored, this is a no-op and returns the existing count.
 *
 * @param config OIDC configuration used to retrieve the current user's devices.
 * @returns A human-readable status message for UI display.
 */
export async function storeDevicesBeforeSession(config: OidcConfig): Promise<string> {
  const storedDevices = getStoredDevices();
  if (storedDevices) {
    return `Devices before session: ${storedDevices.size} registered WebAuthn device(s).`;
  }

  const { devices } = await getWebAuthnDevicesForCurrentUser(config);
  const uuids = devices.map((device) => device.uuid).filter((uuid) => Boolean(uuid));
  window.localStorage.setItem(WEBAUTHN_DEVICES_KEY, JSON.stringify(uuids));
  return `Devices before session: ${uuids.length} registered WebAuthn device(s).`;
}

/**
 * Deletes only the WebAuthn devices that were registered during the current session.
 *
 * This compares the current device list against the snapshot stored by
 * `storeDevicesBeforeSession` and deletes any newly added devices.
 *
 * @param config OIDC configuration used to retrieve and delete WebAuthn devices.
 * @returns A human-readable status message for UI display.
 * @throws When the delete endpoint returns an error shape.
 */
export async function deleteDevicesInSession(config: OidcConfig): Promise<string> {
  const storedDevices = getStoredDevices();
  if (!storedDevices) {
    return 'No devices found. Click Get Registered Devices first.';
  }

  const { userId, webAuthnClient, devices } = await getWebAuthnDevicesForCurrentUser(config);
  const devicesToDelete = devices.filter((device) => !storedDevices.has(device.uuid));

  if (devicesToDelete.length === 0) {
    return `No devices found in this session for user ${userId}.`;
  }

  for (const device of devicesToDelete) {
    const response = await webAuthnClient.webAuthn.delete({
      userId,
      device,
    });

    if (response && hasError(response)) {
      throw new Error(`Failed deleting device ${device.uuid}: ${String(response.error)}`);
    }
  }

  return `Deleted ${devicesToDelete.length} WebAuthn device(s) for user ${userId}.`;
}

/**
 * Deletes all registered WebAuthn devices for the current user.
 *
 * This always clears the stored snapshot in `localStorage` once deletions complete.
 *
 * @param config OIDC configuration used to retrieve and delete WebAuthn devices.
 * @returns A human-readable status message for UI display.
 * @throws When the delete endpoint returns an error shape.
 */
export async function deleteAllDevices(config: OidcConfig): Promise<string> {
  const { userId, webAuthnClient, devices } = await getWebAuthnDevicesForCurrentUser(config);

  if (devices.length === 0) {
    window.localStorage.removeItem(WEBAUTHN_DEVICES_KEY);
    return `No registered WebAuthn devices found for user ${userId}.`;
  }

  for (const device of devices as WebAuthnDevice[]) {
    const response = await webAuthnClient.webAuthn.delete({
      userId,
      device,
    });

    if (response && hasError(response)) {
      throw new Error(`Failed deleting device ${device.uuid}: ${String(response.error)}`);
    }
  }

  window.localStorage.removeItem(WEBAUTHN_DEVICES_KEY);
  return `Deleted ${devices.length} registered WebAuthn device(s) for user ${userId}.`;
}
