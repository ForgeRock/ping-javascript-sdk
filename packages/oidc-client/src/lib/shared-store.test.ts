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
  return { store, rootReducer, dynamicMiddleware } as unknown as SdkStore;
}

function makeFetchMock(onCall?: (url: string) => void) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    onCall?.(url);

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

  it('oidcApi slice is readable from store state after injection', () => {
    const sharedStore = makeSharedStore();
    const typedStore = injectIntoStore(sharedStore);

    // combineSlices registers the reducer on inject(), but state is only recomputed
    // on the next dispatch. Trigger a no-op action to force state recalculation.
    typedStore.dispatch({ type: '@@test/init' });
    const state = typedStore.getState() as Record<string, unknown>;

    expect(state).toHaveProperty(oidcApi.reducerPath);
  });

  it('is idempotent — calling twice does not throw or corrupt state', () => {
    const sharedStore = makeSharedStore();

    expect(() => {
      injectIntoStore(sharedStore);
      injectIntoStore(sharedStore);
    }).not.toThrow();

    const typedStore = injectIntoStore(sharedStore);
    typedStore.dispatch({ type: '@@test/init' });
    const state = typedStore.getState() as Record<string, unknown>;
    expect(state).toHaveProperty(oidcApi.reducerPath);
  });
});

describe('oidc() standalone — no shared store', () => {
  let fetchCallCount = 0;

  beforeEach(() => {
    fetchCallCount = 0;
    vi.stubGlobal('localStorage', makeStorageStub());
    vi.stubGlobal('sessionStorage', makeStorageStub());
    makeFetchMock((url) => {
      if (url.includes('.well-known')) fetchCallCount++;
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
  let wellknownFetchCount = 0;

  beforeEach(() => {
    wellknownFetchCount = 0;
    vi.stubGlobal('localStorage', makeStorageStub());
    vi.stubGlobal('sessionStorage', makeStorageStub());
    makeFetchMock((url) => {
      if (url.includes('.well-known')) wellknownFetchCount++;
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

  it('subscribe() fires when oidcApi state changes on the shared store', async () => {
    const sharedStore = makeSharedStore();
    const client = await oidc({ config: oidcConfig }, sharedStore);

    if ('error' in client) throw new Error('Expected oidc client, got error');

    const listener = vi.fn();
    client.subscribe(listener);

    // Dispatch an oidcApi mutation — any action that causes a state change will notify the subscriber
    const typedStore = injectIntoStore(sharedStore);
    typedStore.dispatch({ type: 'test/action' });

    expect(listener).toHaveBeenCalled();
  });

  it('reuses cached wellknown response — no additional fetch when store already has it', async () => {
    const sharedStore = makeSharedStore();

    // Simulate the owning store (davinci/journey) having already fetched wellknown
    const typedStore = injectIntoStore(sharedStore);
    await typedStore.dispatch(wellknownApi.endpoints.configuration.initiate(TEST_WELLKNOWN_URL));
    const fetchesAfterOwnerInit = wellknownFetchCount;

    // oidc() using the same wellknown URL should hit the RTK Query cache
    await oidc({ config: oidcConfig }, sharedStore);

    expect(wellknownFetchCount).toBe(fetchesAfterOwnerInit);
  });

  it('warns when requestMiddleware is passed alongside sharedStore', async () => {
    const sharedStore = makeSharedStore();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

    // Set log level to 'warn' so the logger actually emits the warning to console.warn.
    // The default level is 'error', which silently suppresses warn/info/debug messages.
    await oidc(
      {
        config: oidcConfig,
        logger: { level: 'warn' },
        requestMiddleware: [() => () => (action: unknown) => action],
      },
      sharedStore,
    );

    const warnCalls = warnSpy.mock.calls.map((args) => args.join(' '));
    expect(warnCalls.some((msg) => msg.includes('requestMiddleware'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('does not warn when no requestMiddleware is passed with sharedStore', async () => {
    const sharedStore = makeSharedStore();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

    await oidc({ config: oidcConfig, logger: { level: 'warn' } }, sharedStore);

    const warnCalls = warnSpy.mock.calls.map((args) => args.join(' '));
    expect(warnCalls.some((msg) => msg.includes('requestMiddleware'))).toBe(false);

    warnSpy.mockRestore();
  });
});
