/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { it, expect, describe } from '@effect/vitest';
import { Micro } from 'effect';
import { deepStrictEqual } from 'node:assert';
import { setupServer } from 'msw/node';
import { logoutµ } from './logout.request.js';
import { OauthTokens, OidcConfig } from './config.types.js';
import { createStorage } from '@forgerock/storage';
import { createClientStore } from './client.store.utils.js';
import { logger as loggerFn } from '@forgerock/sdk-logger';

import { http, HttpResponse } from 'msw';

const server = setupServer(
  // Ping AM End Session
  http.get('*/am/oauth2/:realm/connect/endSession', async ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 400 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Ping AM Revoke
  http.post('*/am/oauth2/:realm/token/revoke', async ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 400 });
    }
    return new HttpResponse(null, { status: 200 });
  }),

  // P1 End Session
  http.get('*/as/idpSignoff', async () => new HttpResponse(null, { status: 204 })),
  http.get('*/as/badIdpSignoff', async () =>
    HttpResponse.json({ error: 'bad request' }, { status: 400 }),
  ),

  // P1 Revoke
  http.post('*/as/revoke', async () => new HttpResponse(null, { status: 204 })),
  http.post('*/as/badRevoke', async () =>
    HttpResponse.json({ error: 'bad request' }, { status: 400 }),
  ),
);

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

const config: OidcConfig = {
  clientId: '123456789',
  redirectUri: 'https://example.com/callback.html',
  scope: 'openid profile',
  serverConfig: {
    wellknown: 'https://example.com/wellknown',
  },
  responseType: 'code',
};

const customStorage: Record<string, string> = {};
const storageClient = createStorage<OauthTokens>({
  type: 'custom',
  name: 'oidcTokens',
  custom: {
    get: async (key: string) => customStorage[key],
    set: async (key: string, valueToSet: string) => {
      customStorage[key] = valueToSet;
    },
    remove: async (key: string) => {
      delete customStorage[key];
    },
  },
});

const logger = loggerFn({ level: 'error' });
const store = createClientStore({ logger });

const tokens = {
  accessToken: '1234567890',
  idToken: '0987654321',
};

const partialWellknown = {
  issuer: 'https://example.com/issuer',
  authorization_endpoint: 'https://example.com/authorize',
  token_endpoint: 'https://example.com/token',
  userinfo_endpoint: 'https://example.com/userinfo',
  introspection_endpoint: 'https://example.com/introspect',
};

describe('Ping AM', () => {
  it.effect('logoutµ succeeds with valid wellknown endpoints', () =>
    Micro.gen(function* () {
      const end_session_endpoint = 'https://example.com/am/oauth2/alpha/connect/endSession';
      const revocation_endpoint = 'https://example.com/am/oauth2/alpha/token/revoke';

      const result = yield* logoutµ({
        tokens,
        config,
        wellknown: {
          ...partialWellknown,
          end_session_endpoint,
          revocation_endpoint,
        },
        store,
        storageClient,
      });

      expect(result).toStrictEqual({
        sessionResponse: null,
        revokeResponse: null,
        deleteResponse: null,
      });
    }),
  );

  it.effect('logoutµ fails on bad endSession', () =>
    Micro.gen(function* () {
      const end_session_endpoint = 'https://example.com/am/oauth2/fake-realm/connect/endSession';
      const revocation_endpoint = 'https://example.com/am/oauth2/alpha/token/revoke';

      const result = yield* Micro.exit(
        logoutµ({
          tokens,
          config,
          wellknown: {
            ...partialWellknown,
            end_session_endpoint,
            revocation_endpoint,
          },
          store,
          storageClient,
        }),
      );

      deepStrictEqual(
        result,
        Micro.exitFail({
          error: 'Inner request error',
          sessionResponse: {
            error: 'End Session failure',
            message: 'An error occurred while ending the session',
            type: 'auth_error',
            status: 400,
          },
          revokeResponse: null,
          deleteResponse: null,
        }),
      );
    }),
  );

  it.effect('logoutµ fails on bad revoke', () =>
    Micro.gen(function* () {
      const end_session_endpoint = 'https://example.com/am/oauth2/alpha/connect/endSession';
      const revocation_endpoint = 'https://example.com/am/oauth2/fake-realm/token/revoke';

      const result = yield* Micro.exit(
        logoutµ({
          tokens,
          config,
          wellknown: {
            ...partialWellknown,
            end_session_endpoint,
            revocation_endpoint,
          },
          store,
          storageClient,
        }),
      );

      deepStrictEqual(
        result,
        Micro.exitFail({
          error: 'Inner request error',
          sessionResponse: null,
          revokeResponse: {
            error: 'End Session failure',
            message: 'An error occurred while ending the session',
            type: 'auth_error',
            status: 400,
          },
          deleteResponse: null,
        }),
      );
    }),
  );
});

describe('PingOne', () => {
  const fakeEndSessionEndpoint = 'https://example.com/endSession';

  it.effect('logoutµ succeeds with valid wellknown endpoints', () =>
    Micro.gen(function* () {
      const ping_end_idp_session_endpoint = 'https://example.com/as/idpSignoff';
      const revocation_endpoint = 'https://example.com/as/revoke';

      const result = yield* logoutµ({
        tokens,
        config,
        wellknown: {
          ...partialWellknown,
          ping_end_idp_session_endpoint,
          end_session_endpoint: fakeEndSessionEndpoint,
          revocation_endpoint,
        },
        store,
        storageClient,
      });

      expect(result).toStrictEqual({
        sessionResponse: null,
        revokeResponse: null,
        deleteResponse: null,
      });
    }),
  );

  it.effect('logoutµ fails on bad endSession', () =>
    Micro.gen(function* () {
      const ping_end_idp_session_endpoint = 'https://example.com/as/badIdpSignoff';
      const revocation_endpoint = 'https://example.com/as/revoke';

      const result = yield* Micro.exit(
        logoutµ({
          tokens,
          config,
          wellknown: {
            ...partialWellknown,
            ping_end_idp_session_endpoint,
            end_session_endpoint: fakeEndSessionEndpoint,
            revocation_endpoint,
          },
          store,
          storageClient,
        }),
      );

      deepStrictEqual(
        result,
        Micro.exitFail({
          error: 'Inner request error',
          sessionResponse: {
            error: 'End Session failure',
            message: 'An error occurred while ending the session',
            type: 'auth_error',
            status: 400,
          },
          revokeResponse: null,
          deleteResponse: null,
        }),
      );
    }),
  );

  it.effect('logoutµ fails on bad revoke', () =>
    Micro.gen(function* () {
      const ping_end_idp_session_endpoint = 'https://example.com/as/idpSignoff';
      const revocation_endpoint = 'https://example.com/as/badRevoke';

      const result = yield* Micro.exit(
        logoutµ({
          tokens,
          config,
          wellknown: {
            ...partialWellknown,
            ping_end_idp_session_endpoint,
            end_session_endpoint: fakeEndSessionEndpoint,
            revocation_endpoint,
          },
          store,
          storageClient,
        }),
      );

      deepStrictEqual(
        result,
        Micro.exitFail({
          error: 'Inner request error',
          sessionResponse: null,
          revokeResponse: {
            error: 'End Session failure',
            message: 'An error occurred while ending the session',
            type: 'auth_error',
            status: 400,
          },
          deleteResponse: null,
        }),
      );
    }),
  );
});
