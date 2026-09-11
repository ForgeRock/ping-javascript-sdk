/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createWellknownSelector, wellknownApi, wellknownSelector } from './wellknown.api.js';

import type { WellknownResponse } from '@forgerock/sdk-types';

const URL_A = 'https://a.example.com/as/.well-known/openid-configuration';
const URL_B = 'https://b.example.com/as/.well-known/openid-configuration';

function wellknownFixture(overrides: Partial<WellknownResponse> = {}) {
  return {
    issuer: 'https://a.example.com/as',
    authorization_endpoint: 'https://a.example.com/as/authorize',
    token_endpoint: 'https://a.example.com/as/token',
    userinfo_endpoint: 'https://a.example.com/as/userinfo',
    jwks_uri: 'https://a.example.com/as/jwks',
    ...overrides,
  };
}

function makeStore() {
  return configureStore({
    reducer: { [wellknownApi.reducerPath]: wellknownApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(wellknownApi.middleware),
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('wellknownApi', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let calledUrls: string[];

  beforeEach(() => {
    calledUrls = [];
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      calledUrls.push(url);
      return jsonResponse(wellknownFixture());
    }) as ReturnType<typeof vi.spyOn>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    wellknownApi.util.resetApiState();
  });

  it('fetches the configuration exactly once for a single URL', async () => {
    // Arrange
    const store = makeStore();

    // Act
    const result = await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert
    expect(result.data).toMatchObject({ issuer: 'https://a.example.com/as' });
    expect(calledUrls).toHaveLength(1);
  });

  it('serves the second identical request from cache without a second network call', async () => {
    // Arrange
    const store = makeStore();

    // Act
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert — this is the property the shared store depends on
    expect(calledUrls).toEqual([URL_A]);
  });

  it('keeps a separate cache entry per URL', async () => {
    // Arrange
    const store = makeStore();

    // Act
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_B));

    // Assert
    expect(calledUrls).toEqual([URL_A, URL_B]);
    expect(wellknownSelector(URL_A, store.getState())).toBeDefined();
    expect(wellknownSelector(URL_B, store.getState())).toBeDefined();
  });

  it('maps a non-2xx response to an error rather than throwing', async () => {
    // Arrange
    fetchSpy.mockImplementation(async () => jsonResponse({ message: 'nope' }, 500));
    const store = makeStore();

    // Act
    const result = await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });

  it('maps a structurally invalid well-known payload to an error', async () => {
    // Arrange — missing issuer/authorization_endpoint/token_endpoint
    fetchSpy.mockImplementation(async () =>
      jsonResponse({ jwks_uri: 'https://a.example.com/jwks' }),
    );
    const store = makeStore();

    // Act
    const result = await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });

  it('maps a network rejection to an error rather than throwing', async () => {
    // Arrange
    fetchSpy.mockImplementation(async () => {
      throw new Error('connection refused');
    });
    const store = makeStore();

    // Act
    const result = await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});

describe('createWellknownSelector', () => {
  it('returns the same selector instance for the same URL', () => {
    // Arrange / Act
    const first = createWellknownSelector(URL_A);
    const second = createWellknownSelector(URL_A);

    // Assert — without this, memoization is rebuilt on every call and never hits
    expect(first).toBe(second);
  });

  it('returns distinct selector instances for distinct URLs', () => {
    // Arrange / Act
    const a = createWellknownSelector(URL_A);
    const b = createWellknownSelector(URL_B);

    // Assert
    expect(a).not.toBe(b);
  });

  it('does not recompute when called repeatedly against unchanged state', async () => {
    // Arrange
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => jsonResponse(wellknownFixture()));
    const store = makeStore();
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));
    const selector = createWellknownSelector(URL_A);

    // Act
    selector(store.getState());
    const afterFirst = selector.recomputations();
    selector(store.getState());
    selector(store.getState());

    // Assert
    expect(selector.recomputations()).toBe(afterFirst);

    vi.restoreAllMocks();
    wellknownApi.util.resetApiState();
  });
});

describe('wellknownSelector', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    wellknownApi.util.resetApiState();
  });

  it('returns undefined before the configuration has been fetched', () => {
    // Arrange
    const store = makeStore();

    // Act / Assert
    expect(wellknownSelector(URL_A, store.getState())).toBeUndefined();
  });

  it('returns the cached configuration after a successful fetch', async () => {
    // Arrange
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => jsonResponse(wellknownFixture()));
    const store = makeStore();

    // Act
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert
    expect(wellknownSelector(URL_A, store.getState())).toMatchObject({
      issuer: 'https://a.example.com/as',
    });
  });

  it('returns undefined when the fetch failed', async () => {
    // Arrange
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => jsonResponse({}, 500));
    const store = makeStore();

    // Act
    await store.dispatch(wellknownApi.endpoints.configuration.initiate(URL_A));

    // Assert
    expect(wellknownSelector(URL_A, store.getState())).toBeUndefined();
  });
});
