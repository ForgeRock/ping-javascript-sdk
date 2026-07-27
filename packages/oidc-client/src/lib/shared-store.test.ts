// @vitest-environment node
/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineSlices, configureStore, createDynamicMiddleware } from '@reduxjs/toolkit';

import { wellknownApi } from '@forgerock/sdk-wellknown';
import { oidc } from './client.store.js';
import { injectIntoStore } from './client.store.utils.js';
import { oidcApi } from './oidc.api.js';

import type { SdkStore } from '@forgerock/sdk-types';
import type { OidcConfig } from './config.types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Constructs a minimal InjectableStore that mirrors what davinci()/journey() creates,
 * but without importing those packages. Uses only RTK primitives.
 */
function makeSharedStore(): SdkStore {
  const dynamicMiddleware = createDynamicMiddleware();
  const rootReducer = combineSlices(wellknownApi).withLazyLoadedSlices();
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(wellknownApi.middleware).concat(dynamicMiddleware.middleware),
  });
  // Cast to SdkStore the same way toSdkStore() does
  return { store, rootReducer, dynamicMiddleware } as unknown as SdkStore;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('injectIntoStore()', () => {
  it('calls rootReducer.inject with oidcApi', () => {
    const dynamicMiddleware = createDynamicMiddleware();
    const rootReducer = combineSlices(wellknownApi).withLazyLoadedSlices();
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(dynamicMiddleware.middleware),
    });

    const injectable = { store, rootReducer, dynamicMiddleware } as unknown as SdkStore;

    const injectSpy = vi.spyOn(rootReducer, 'inject');
    injectIntoStore(injectable);

    expect(injectSpy).toHaveBeenCalledWith(oidcApi);
  });

  it('calls dynamicMiddleware.addMiddleware with oidcApi.middleware', () => {
    const dynamicMiddleware = createDynamicMiddleware();
    const rootReducer = combineSlices(wellknownApi).withLazyLoadedSlices();
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(dynamicMiddleware.middleware),
    });

    const injectable = { store, rootReducer, dynamicMiddleware } as unknown as SdkStore;

    const addMiddlewareSpy = vi.spyOn(dynamicMiddleware, 'addMiddleware');
    injectIntoStore(injectable);

    expect(addMiddlewareSpy).toHaveBeenCalledWith(oidcApi.middleware);
  });
});

describe('oidc() standalone — no shared store', () => {
  let fetchCallCount = 0;

  beforeEach(() => {
    fetchCallCount = 0;
    vi.stubGlobal('localStorage', makeStorageStub());
    vi.stubGlobal('sessionStorage', makeStorageStub());

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      fetchCallCount++;

      if (url.includes('.well-known')) {
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
  });

  it('creates its own store and returns a working client', async () => {
    const client = await oidc({ config: oidcConfig });

    expect('error' in client).toBe(false);
    if ('error' in client) throw new Error('Expected oidc client, got error');

    expect(client.subscribe).toBeInstanceOf(Function);
    expect(client.token).toBeDefined();
    expect(client.authorize).toBeDefined();
  });

  it('fetches wellknown during init', async () => {
    await oidc({ config: oidcConfig });

    expect(fetchCallCount).toBeGreaterThan(0);
  });
});

describe('oidc() with shared store', () => {
  let fetchCallCount = 0;

  beforeEach(() => {
    fetchCallCount = 0;
    vi.stubGlobal('localStorage', makeStorageStub());
    vi.stubGlobal('sessionStorage', makeStorageStub());

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      fetchCallCount++;

      if (url.includes('.well-known')) {
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
  });

  it('resolves without error when given a shared SdkStore', async () => {
    const sharedStore = makeSharedStore();
    const client = await oidc({ config: oidcConfig }, sharedStore);

    expect('error' in client).toBe(false);
    if ('error' in client) throw new Error('Expected oidc client, got error');

    expect(client.subscribe).toBeInstanceOf(Function);
    expect(client.token).toBeDefined();
    expect(client.authorize).toBeDefined();
  });

  it('subscribe() returns an unsubscribe function', async () => {
    const sharedStore = makeSharedStore();
    const client = await oidc({ config: oidcConfig }, sharedStore);

    if ('error' in client) throw new Error('Expected oidc client, got error');

    const listener = vi.fn();
    const unsubscribe = client.subscribe(listener);

    expect(unsubscribe).toBeInstanceOf(Function);
  });

  it('reuses cached wellknown response — no additional fetch when store already has it', async () => {
    const sharedStore = makeSharedStore();

    // Pre-populate the wellknown cache by routing through the typed store from injectIntoStore
    const typedStore = injectIntoStore(sharedStore);
    await typedStore.dispatch(wellknownApi.endpoints.configuration.initiate(TEST_WELLKNOWN_URL));
    const fetchesAfterPreload = fetchCallCount;

    // oidc() should hit the cache, not make another wellknown request
    await oidc({ config: oidcConfig }, sharedStore);

    expect(fetchCallCount).toBe(fetchesAfterPreload);
  });
});
