// @vitest-environment node
/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { wellknownApi } from '@forgerock/sdk-store';
import { oidcApi } from './oidc.api.js';

import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';

/**
 * Regression coverage for the shared-store middleware leak.
 *
 * OIDC endpoints resolve their middleware and logger from the store's thunk
 * `extraArgument`. When a store is shared with davinci/journey, that `extra`
 * belongs to the owning client — so before the per-client registry, DaVinci
 * middleware executed against TOKEN_EXCHANGE, REVOKE, END_SESSION and friends,
 * and oidc's own logger was silently discarded.
 *
 * These tests build a store whose `extra` carries slots for two clients and
 * assert that oidc endpoints only ever see their own.
 */

const REVOKE_URL = 'https://example.pingone.com/test-env/as/revoke';

function recordingMiddleware(calls: string[], label: string): RequestMiddleware {
  return (_req, action, next) => {
    calls.push(`${label}:${action.type}`);
    next();
  };
}

function makeLoggerSpy() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

/** A store shaped like a shared SDK store: one `extra`, one slot per client. */
function makeTwoClientStore(slots: Record<string, unknown>) {
  return configureStore({
    reducer: {
      [oidcApi.reducerPath]: oidcApi.reducer,
      [wellknownApi.reducerPath]: wellknownApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: { clients: slots } } })
        .concat(wellknownApi.middleware)
        .concat(oidcApi.middleware),
  });
}

describe('oidc endpoints resolve middleware and logger per client', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(JSON.stringify({ access_token: 'at', token_type: 'Bearer' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    oidcApi.util.resetApiState();
  });

  it('does not run another client\u2019s requestMiddleware against an OIDC request', async () => {
    // Arrange
    const calls: string[] = [];
    const store = makeTwoClientStore({
      davinci: {
        requestMiddleware: [recordingMiddleware(calls, 'davinci')],
        logger: makeLoggerSpy(),
      },
      oidc: { requestMiddleware: [], logger: makeLoggerSpy() },
    });

    // Act
    await store.dispatch(
      oidcApi.endpoints.revoke.initiate({
        accessToken: 'test-access-token',
        clientId: 'test-client-id',
        endpoint: REVOKE_URL,
      }),
    );

    // Assert — before the per-client registry this recorded 'davinci:TOKEN_EXCHANGE'
    expect(calls).toEqual([]);
  });

  it("runs the OIDC client's own requestMiddleware against an OIDC request", async () => {
    // Arrange
    const calls: string[] = [];
    const store = makeTwoClientStore({
      davinci: { requestMiddleware: [recordingMiddleware(calls, 'davinci')] },
      oidc: {
        requestMiddleware: [recordingMiddleware(calls, 'oidc')],
        logger: makeLoggerSpy(),
      },
    });

    // Act
    await store.dispatch(
      oidcApi.endpoints.revoke.initiate({
        accessToken: 'test-access-token',
        clientId: 'test-client-id',
        endpoint: REVOKE_URL,
      }),
    );

    // Assert
    expect(calls.filter((c) => c.startsWith('oidc:'))).not.toHaveLength(0);
    expect(calls.filter((c) => c.startsWith('davinci:'))).toHaveLength(0);
  });

  it('ignores a store-wide flat middleware list (the original leak shape)', async () => {
    // Arrange — this is exactly what davinci/journey used to put in extraArgument.
    // If oidc ever reads the whole `extra` again instead of its own slot, this fails.
    const calls: string[] = [];
    const store = configureStore({
      reducer: {
        [oidcApi.reducerPath]: oidcApi.reducer,
        [wellknownApi.reducerPath]: wellknownApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          thunk: {
            extraArgument: {
              requestMiddleware: [recordingMiddleware(calls, 'store-wide')],
              logger: makeLoggerSpy(),
            },
          },
        })
          .concat(wellknownApi.middleware)
          .concat(oidcApi.middleware),
    });

    // Act
    await store.dispatch(
      oidcApi.endpoints.revoke.initiate({
        accessToken: 'test-access-token',
        clientId: 'test-client-id',
        endpoint: REVOKE_URL,
      }),
    );

    // Assert
    expect(calls).toEqual([]);
  });

  it("uses the OIDC client's own logger, not the owning client's", async () => {
    // Arrange
    const oidcLogger = makeLoggerSpy();
    const davinciLogger = makeLoggerSpy();
    const store = makeTwoClientStore({
      davinci: { requestMiddleware: [], logger: davinciLogger },
      oidc: { requestMiddleware: [], logger: oidcLogger },
    });

    // Act
    await store.dispatch(
      oidcApi.endpoints.revoke.initiate({
        accessToken: 'test-access-token',
        clientId: 'test-client-id',
        endpoint: REVOKE_URL,
      }),
    );

    // Assert
    const oidcCalls =
      oidcLogger.debug.mock.calls.length +
      oidcLogger.info.mock.calls.length +
      oidcLogger.error.mock.calls.length;
    const davinciCalls =
      davinciLogger.debug.mock.calls.length +
      davinciLogger.info.mock.calls.length +
      davinciLogger.error.mock.calls.length;

    expect(oidcCalls).toBeGreaterThan(0);
    expect(davinciCalls).toBe(0);
  });
});
