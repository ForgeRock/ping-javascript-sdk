// @vitest-environment node
/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSdkStore, wellknownApi } from '@forgerock/sdk-store';
import { oidc } from './client.store.js';
import { oidcApi } from './oidc.api.js';

import type { OidcConfig } from './config.types.js';

/**
 * Lifecycle guarantees for a store the caller owns.
 *
 * RTK's `inject` is irreversible, so mutating a caller's store before the
 * arguments have been validated leaves it permanently carrying a slice from a
 * call that never succeeded. And because `oidcApi.reducerPath` is the fixed
 * string 'oidc', two clients with different clientIds on one store would share
 * a single cache slice and silently clobber each other's tokens.
 */

const TEST_WELLKNOWN_URL =
  'https://example.pingone.com/test-env/as/.well-known/openid-configuration';

const mockWellknownResponse = {
  issuer: 'https://example.pingone.com/test-env/as',
  authorization_endpoint: 'https://example.pingone.com/test-env/as/authorize',
  token_endpoint: 'https://example.pingone.com/test-env/as/token',
  userinfo_endpoint: 'https://example.pingone.com/test-env/as/userinfo',
  jwks_uri: 'https://example.pingone.com/test-env/as/jwks',
  revocation_endpoint: 'https://example.pingone.com/test-env/as/revoke',
};

const oidcConfig: OidcConfig = {
  clientId: 'test-client-id',
  redirectUri: 'http://localhost/callback',
  scope: 'openid profile',
  serverConfig: { wellknown: TEST_WELLKNOWN_URL },
  responseType: 'code',
};

function makeStorageStub() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i: number) => [...store.keys()][i] ?? null,
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeStorageStub());
  vi.stubGlobal('sessionStorage', makeStorageStub());
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () =>
      new Response(JSON.stringify(mockWellknownResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  wellknownApi.util.resetApiState();
  oidcApi.util.resetApiState();
});

describe('a failed oidc() leaves a caller-owned store untouched', () => {
  it('does not mount the oidc slice when wellknown is missing', async () => {
    // Arrange
    const store = createSdkStore();

    // Act
    const result = await oidc({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: { ...oidcConfig, serverConfig: {} } as any,
      store,
    });

    // Assert
    expect(result).toHaveProperty('type', 'argument_error');
    expect(Object.keys(store.store.getState() as object)).not.toContain(oidcApi.reducerPath);
  });

  it('does not register a client slot when clientId is missing', async () => {
    // Arrange
    const store = createSdkStore();

    // Act
    const result = await oidc({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: { ...oidcConfig, clientId: '' } as any,
      store,
    });

    // Assert
    expect(result).toHaveProperty('type', 'argument_error');
    expect(store.extra.clients).toEqual({});
  });

  it('leaves the store reusable for a subsequent valid call', async () => {
    // Arrange
    const store = createSdkStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await oidc({ config: { ...oidcConfig, clientId: '' } as any, store });

    // Act — the caller fixes their config and retries on the same store
    const client = await oidc({ config: oidcConfig, store });

    // Assert
    if ('error' in client) throw new Error(`Expected oidc client, got ${client.error}`);
    expect(Object.keys(store.extra.clients)).toEqual([oidcApi.reducerPath]);
  });
});

describe('one oidc client per shared store', () => {
  it('is idempotent when re-initialised with the same clientId', async () => {
    // Arrange
    const store = createSdkStore();
    await oidc({ config: oidcConfig, store });

    // Act
    const second = await oidc({ config: oidcConfig, store });

    // Assert — re-init is a legitimate operation
    if ('error' in second) throw new Error(`Expected oidc client, got ${second.error}`);
    expect(second.token).toBeDefined();
  });

  it('errors when a second client with a different clientId joins the same store', async () => {
    // Arrange
    const store = createSdkStore();
    await oidc({ config: oidcConfig, store });

    // Act
    const second = await oidc({
      config: { ...oidcConfig, clientId: 'a-different-client' },
      store,
    });

    // Assert — silently sharing one 'oidc' cache slice would clobber tokens
    expect(second).toHaveProperty('type', 'argument_error');
    expect((second as { error: string }).error).toMatch(/clientId/i);
  });

  it('allows different clientIds on separate stores', async () => {
    // Act
    const first = await oidc({ config: oidcConfig, store: createSdkStore() });
    const second = await oidc({
      config: { ...oidcConfig, clientId: 'a-different-client' },
      store: createSdkStore(),
    });

    // Assert
    expect('error' in first).toBe(false);
    expect('error' in second).toBe(false);
  });
});
