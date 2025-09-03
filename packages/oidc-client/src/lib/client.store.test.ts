/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { it, expect, describe, vi } from 'vitest';

import { oidc } from './client.store.js';

import type { OidcConfig } from './config.types.js';

vi.stubGlobal(
  'sessionStorage',
  (() => {
    let store: Record<string, string> = {};

    return {
      getItem(key: string) {
        console.log('getItem', key);
        return store[key] || null;
      },
      setItem(key: string) {
        store[key] =
          '{"clientId":"123456789","serverConfig":{"baseUrl":"https://api.example.com"},"responseType":"code","redirectUri":"https://example.com/callback.html","scope":"openid profile","state":"NzUyNDUyMDAxOTMyNDUxNzI1NjkxNDc2MjEyMzUwMjQzMzQyMjE4OQ","verifier":"ODgyMzk2MjQ1MTkwMjQzMTkxNzcxNzcxNTUyMzgxMDcxNDgxOTcyMTIxMzQxNzYyMDkxNTMxMjcxMjI0MTU5MTY2MjI5MjA3MTk5MjM0MzcyMjQyMjI5"}';
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        store = {};
      },
    };
  })(),
);

const server = setupServer(
  // P1 Revoke
  http.post('*/as/authorize', async () => {
    console.log('authorize request received');
    return HttpResponse.json({
      authorizeResponse: {
        code: 123,
        state: 'NzUyNDUyMDAxOTMyNDUxNzI1NjkxNDc2MjEyMzUwMjQzMzQyMjE4OQ',
      },
    });
  }),
  http.post('*/as/token', async () =>
    HttpResponse.json({
      access_token: 'abcdefghijklmnop',
      id_token: '0987654321',
    }),
  ),
  http.post('*/as/revoke', async () => HttpResponse.json(null, { status: 204 })),
  http.get('*/wellknown', async () =>
    HttpResponse.json({
      issuer: 'https://api.example.com/as/issuer',
      authorization_endpoint: 'https://api.example.com/as/authorize',
      token_endpoint: 'https://api.example.com/as/token',
      userinfo_endpoint: 'https://api.example.com/as/userinfo',
      introspection_endpoint: 'https://api.example.com/as/introspect',
      revocation_endpoint: 'https://api.example.com/as/revoke',
      response_types_supported: ['code', 'token', 'id_token', 'code id_token'],
      response_modes_supported: ['query', 'fragment', 'form_post', 'pi.flow'],
    }),
  ),
);

const storageKey = 'pic-oidcTokens';
const storeObj: Record<string, string> = {};
const customStorage = {
  get: async (key: string): Promise<string | null> => storeObj[key] || null,
  set: async (key: string, valueToSet: string) => {
    storeObj[key] = valueToSet;
  },
  remove: async (key: string) => {
    delete storeObj[key];
  },
};
const customStorageConfig = {
  type: 'custom' as const,
  name: 'oidcTokens',
  custom: customStorage,
};

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers and storage that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  customStorage.remove(storageKey);
});

// Clean up after the tests are finished.
afterAll(() => server.close());

// Only testing PingOne flow since iframe flow cannot be mocked in Vitest
describe('PingOne token get method', async () => {
  const config: OidcConfig = {
    clientId: '123456789',
    redirectUri: 'https://example.com/callback.html',
    scope: 'openid profile',
    serverConfig: {
      wellknown: 'https://api.example.com/wellknown',
    },
    responseType: 'code',
  };

  it('Get non-existent tokens', async () => {
    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get();
    if (!('error' in tokens)) {
      expect.fail();
    }
    expect(tokens.error).toBe('No tokens found');
  });

  it('Get tokens', async () => {
    customStorage.set(
      storageKey,
      JSON.stringify({
        accessToken: '1234567890',
        idToken: '0987654321',
        expiresAt: Date.now() + 10000,
      }),
    );

    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get();
    if ('error' in tokens) {
      expect.fail();
    }
    expect(tokens.accessToken).toBe('1234567890');
  });

  it('Get expired tokens without background renewal', async () => {
    customStorage.set(
      storageKey,
      JSON.stringify({
        accessToken: '1234567890',
        idToken: '0987654321',
        expiresAt: Date.now() + 10000,
      }),
    );

    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get();
    if ('error' in tokens) {
      expect.fail();
    }
    expect(tokens.accessToken).toBe('1234567890');
  });

  it('Get unexpired tokens with background renew true', async () => {
    const expiredTokens = {
      accessToken: '1234567890',
      idToken: '0987654321',
      expiresAt: 40000,
      expiryTimestamp: Date.now() + 40000,
    };
    customStorage.set(storageKey, JSON.stringify(expiredTokens));

    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get({ backgroundRenew: true });
    if ('error' in tokens) {
      console.log('tokens error', tokens);
      expect.fail();
    }
    expect(tokens.accessToken).toBe('1234567890');
  });

  it('Renew tokens within threshold', async () => {
    const expiredTokens = {
      accessToken: '1234567890',
      idToken: '0987654321',
      expiresAt: 20000,
      expiryTimestamp: Date.now() + 20000,
    };
    customStorage.set(storageKey, JSON.stringify(expiredTokens));

    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get({ backgroundRenew: true });
    if ('error' in tokens) {
      console.log('tokens error', tokens);
      expect.fail();
    }
    expect(tokens.accessToken).toBe('abcdefghijklmnop');
  });

  it('Get expired tokens', async () => {
    const expiredTokens = {
      accessToken: '1234567890',
      idToken: '0987654321',
      expiresAt: 1000,
      expiryTimestamp: Date.now() - 1000,
    };
    customStorage.set(storageKey, JSON.stringify(expiredTokens));

    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get({ backgroundRenew: true });
    if ('error' in tokens) {
      console.log('tokens error', tokens);
      expect.fail();
    }
    expect(tokens.accessToken).toBe('abcdefghijklmnop');
  });

  it('Force renew tokens', async () => {
    const expiredTokens = {
      accessToken: '1234567890',
      idToken: '0987654321',
      expiresAt: 50000,
      expiryTimestamp: Date.now() + 50000,
    };
    customStorage.set(storageKey, JSON.stringify(expiredTokens));

    const oidcClient = await oidc({
      config,
      storage: customStorageConfig,
    });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }
    const tokens = await oidcClient.token.get({ backgroundRenew: true, forceRenew: true });
    if ('error' in tokens) {
      console.log('tokens error', tokens);
      expect.fail();
    }
    expect(tokens.accessToken).toBe('abcdefghijklmnop');
  });
});
