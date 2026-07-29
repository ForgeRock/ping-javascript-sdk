/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { describe, expect, it, vi } from 'vitest';

import { createSdkStore, injectClient, isSdkStoreHandle } from './store.effects.js';
import { wellknownApi } from './wellknown.api.js';

const fakeApi = createApi({
  reducerPath: 'fake',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    ping: builder.query<object, void>({ queryFn: async () => ({ data: {} }) }),
  }),
});

const otherApi = createApi({
  reducerPath: 'other',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    ping: builder.query<object, void>({ queryFn: async () => ({ data: {} }) }),
  }),
});

const fakeSlice = createSlice({
  name: 'fakeSlice',
  initialState: { value: 0 },
  reducers: { bump: (state) => ({ value: state.value + 1 }) },
});

/** Stand-in for a request middleware; sdk-store does not depend on its type. */
function noopMiddleware() {
  return (_req: unknown, _action: unknown, next: () => unknown) => {
    next();
  };
}

describe('createSdkStore', () => {
  it('produces a handle that satisfies the shared contract', () => {
    // Act
    const handle = createSdkStore();

    // Assert
    expect(isSdkStoreHandle(handle)).toBe(true);
  });

  it('mounts the wellknown slice so discovery is shared from the start', () => {
    // Act
    const handle = createSdkStore();

    // Assert
    expect(Object.keys(handle.store.getState() as object)).toContain(wellknownApi.reducerPath);
  });

  it('starts with an empty client registry on the store extra', () => {
    // Act
    const handle = createSdkStore();

    // Assert
    expect(handle.extra.clients).toEqual({});
  });

  it('returns an independent store on each call', () => {
    // Act
    const a = createSdkStore();
    const b = createSdkStore();

    // Assert
    expect(a.store).not.toBe(b.store);
    expect(a.extra).not.toBe(b.extra);
  });
});

describe('isSdkStoreHandle', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a number', 42],
    ['a string', 'store'],
    ['an empty object', {}],
    [
      'an object missing dynamicMiddleware',
      { store: {}, rootReducer: { inject: () => undefined } },
    ],
    ['a bare redux store', { dispatch: () => undefined, getState: () => ({}) }],
  ])('rejects %s', (_label, candidate) => {
    // Assert — a bad handle must be detectable before we mutate anything
    expect(isSdkStoreHandle(candidate)).toBe(false);
  });

  it('accepts a real handle', () => {
    expect(isSdkStoreHandle(createSdkStore())).toBe(true);
  });
});

describe('injectClient', () => {
  it('mounts the client api reducer and makes it readable immediately', () => {
    // Arrange
    const handle = createSdkStore();

    // Act
    injectClient(handle, { api: fakeApi, reducerPath: fakeApi.reducerPath });

    // Assert — no manual dispatch required by the caller
    expect(Object.keys(handle.store.getState() as object)).toContain('fake');
  });

  it('mounts additional slices supplied by the client', () => {
    // Arrange
    const handle = createSdkStore();

    // Act
    injectClient(handle, {
      api: fakeApi,
      reducerPath: fakeApi.reducerPath,
      slices: [fakeSlice],
    });

    // Assert
    expect(Object.keys(handle.store.getState() as object)).toContain('fakeSlice');
  });

  it('registers the client slot under its reducerPath', () => {
    // Arrange
    const handle = createSdkStore();
    const mw = noopMiddleware();

    // Act
    injectClient(handle, {
      api: fakeApi,
      reducerPath: fakeApi.reducerPath,
      requestMiddleware: [mw],
    });

    // Assert
    expect(handle.extra.clients['fake']?.requestMiddleware).toEqual([mw]);
  });

  it('keeps each client slot separate', () => {
    // Arrange
    const handle = createSdkStore();
    const first = noopMiddleware();
    const second = noopMiddleware();

    // Act
    injectClient(handle, {
      api: fakeApi,
      reducerPath: fakeApi.reducerPath,
      requestMiddleware: [first],
    });
    injectClient(handle, {
      api: otherApi,
      reducerPath: otherApi.reducerPath,
      requestMiddleware: [second],
    });

    // Assert
    expect(handle.extra.clients['fake']?.requestMiddleware).toEqual([first]);
    expect(handle.extra.clients['other']?.requestMiddleware).toEqual([second]);
  });

  it('adds the api middleware to the dynamic chain', () => {
    // Arrange
    const handle = createSdkStore();
    const spy = vi.spyOn(handle.dynamicMiddleware, 'addMiddleware');

    // Act
    injectClient(handle, { api: fakeApi, reducerPath: fakeApi.reducerPath });

    // Assert
    expect(spy).toHaveBeenCalledWith(fakeApi.middleware);
  });

  it('is idempotent for repeated injection of the same client', () => {
    // Arrange
    const handle = createSdkStore();
    const spy = vi.spyOn(handle.dynamicMiddleware, 'addMiddleware');

    // Act
    injectClient(handle, { api: fakeApi, reducerPath: fakeApi.reducerPath });
    const afterFirst = Object.keys(handle.store.getState() as object).sort();
    injectClient(handle, { api: fakeApi, reducerPath: fakeApi.reducerPath });

    // Assert
    expect(Object.keys(handle.store.getState() as object).sort()).toEqual(afterFirst);
    expect(spy).toHaveBeenCalledTimes(1); // middleware must not be double-registered
  });

  it('throws a descriptive error when handed something that is not a handle', () => {
    // Assert — better than a TypeError from deep inside a factory
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      injectClient({} as any, { api: fakeApi, reducerPath: fakeApi.reducerPath }),
    ).toThrow(/not a valid SDK store/i);
  });
});
