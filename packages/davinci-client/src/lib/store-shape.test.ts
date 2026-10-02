/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expect, it } from 'vitest';

import { createClientStore } from './client.store.utils.js';

/**
 * `combineSlices` keys each reducer off `slice.reducerPath ?? slice.name`, where
 * the previous `configureStore({ reducer: { ... } })` form spelled the keys out
 * literally. That makes the published state shape an implicit consequence of
 * slice metadata: renaming `nodeSlice.name` would silently reshape the store.
 *
 * These assertions pin the shape so such a rename fails loudly here instead of
 * in a consumer's selectors.
 */
describe('davinci store shape', () => {
  it('exposes exactly the expected top-level state keys', () => {
    // Arrange
    const { store } = createClientStore({});

    // Act
    const keys = Object.keys(store.getState()).sort();

    // Assert
    expect(keys).toEqual(['config', 'davinci', 'node', 'wellknown']);
  });

  it('registers this client\u2019s slot on the store extra, keyed by reducerPath', async () => {
    // Arrange
    const { store } = createClientStore({});
    let observed: unknown;

    // Act — a thunk is the supported way to observe extraArgument
    await store.dispatch(((_dispatch: unknown, _getState: unknown, extra: unknown) => {
      observed = extra;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);

    // Assert
    expect(observed).toHaveProperty('clients.davinci');
  });
});
