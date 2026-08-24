// @vitest-environment node
/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSdkStore, isSdkStoreHandle, wellknownApi } from '@forgerock/sdk-store';
import { oidc } from './client.store.js';
import { createClientStore } from './client.store.utils.js';
import { oidcApi } from './oidc.api.js';

import type { OidcConfig } from './config.types.js';

/**
 * Coverage for the three store-ownership modes.
 *
 * An earlier version of these tests hand-built a lookalike handle from RTK
 * primitives specifically to avoid importing another client package. That made
 * them blind to the only failure mode this feature really has: the producing and
 * consuming sides of the handle drifting apart. Everything here goes through the
 * real `createSdkStore()` and the real `oidc()` factory instead.
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
  introspection_endpoint: 'https://example.pingone.com/test-env/as/introspect',
  pushed_authorization_request_endpoint: 'https://example.pingone.com/test-env/as/par',
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

let wellknownFetchCount = 0;

beforeEach(() => {
  wellknownFetchCount = 0;
  vi.stubGlobal('localStorage', makeStorageStub());
  vi.stubGlobal('sessionStorage', makeStorageStub());
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : (input as Request).url;

    if (url.includes('.well-known')) {
      wellknownFetchCount++;
      return new Response(JSON.stringify(mockWellknownResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  wellknownApi.util.resetApiState();
  oidcApi.util.resetApiState();
});

describe('mode 1 — implicit store (default, unchanged behaviour)', () => {
  it('creates its own store and returns a working client', async () => {
    // Act
    const client = await oidc({ config: oidcConfig });

    // Assert
    if ('error' in client) throw new Error(`Expected oidc client, got ${client.error}`);
    expect(client.subscribe).toBeInstanceOf(Function);
    expect(client.token).toBeDefined();
    expect(client.authorize).toBeDefined();
  });

  it('fetches the discovery document exactly once', async () => {
    // Act
    await oidc({ config: oidcConfig });

    // Assert — absolute, not "greater than zero"
    expect(wellknownFetchCount).toBe(1);
  });

  it('does not share state between two independent clients', async () => {
    // Act
    const first = createClientStore({});
    const second = createClientStore({});

    // Assert
    expect(first.store).not.toBe(second.store);
  });
});

describe('mode 3 — consumer-owned store', () => {
  it('accepts a store created by createSdkStore()', async () => {
    // Arrange
    const store = createSdkStore();

    // Act
    const client = await oidc({ config: oidcConfig, store });

    // Assert
    if ('error' in client) throw new Error(`Expected oidc client, got ${client.error}`);
    expect(client.token).toBeDefined();
  });

  it('mounts the oidc slice onto the provided store', async () => {
    // Arrange
    const store = createSdkStore();

    // Act
    await oidc({ config: oidcConfig, store });

    // Assert
    expect(Object.keys(store.store.getState() as object)).toContain(oidcApi.reducerPath);
  });

  it('registers only the oidc slot on the shared registry', async () => {
    // Arrange
    const store = createSdkStore();

    // Act
    await oidc({ config: oidcConfig, store });

    // Assert
    expect(Object.keys(store.extra.clients)).toEqual([oidcApi.reducerPath]);
  });

  it('reuses a discovery document already cached on the shared store', async () => {
    // Arrange — simulate the owning client having already fetched it
    const store = createSdkStore();
    await store.store.dispatch(
      wellknownApi.endpoints.configuration.initiate(TEST_WELLKNOWN_URL) as never,
    );
    expect(wellknownFetchCount).toBe(1);

    // Act
    await oidc({ config: oidcConfig, store });

    // Assert — still exactly one, so oidc served from cache
    expect(wellknownFetchCount).toBe(1);
  });

  it('honours this client\u2019s own requestMiddleware on a shared store', async () => {
    // Arrange
    const store = createSdkStore();

    // Act
    await oidc({
      config: oidcConfig,
      store,
      requestMiddleware: [
        (_req, _action, next) => {
          next();
        },
      ],
    });

    // Assert — middleware is no longer discarded on the shared path
    expect(store.extra.clients[oidcApi.reducerPath]?.requestMiddleware).toHaveLength(1);
  });
});

describe('store handle contract', () => {
  it('the handle produced for a client satisfies the shared guard', () => {
    // Arrange / Act
    const handle = createClientStore({});

    // Assert — the producing side of the contract
    expect(isSdkStoreHandle(handle)).toBe(true);
  });

  it('rejects a value that is not a store handle', async () => {
    // Act
    const client = await oidc({
      config: oidcConfig,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store: { not: 'a store' } as any,
    });

    // Assert — a clear argument error, not a TypeError from inside RTK
    expect(client).toHaveProperty('type', 'argument_error');
    expect((client as { error: string }).error).toMatch(/not a valid SDK store/i);
  });
});
