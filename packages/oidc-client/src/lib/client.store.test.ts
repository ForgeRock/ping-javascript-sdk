/*
 * Copyright © 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { it, expect, describe, vi, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';

import { oidc } from './client.store.js';

import type { OidcConfig } from './config.types.js';

Object.defineProperty(global, 'localStorage', { value: null });

vi.stubGlobal(
  'sessionStorage',
  (() => {
    let store: Record<string, string> = {};

    return {
      getItem(key: string) {
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

const parRequestUri = 'urn:ietf:params:oauth:request_uri:test-par-request-uri';

const server = setupServer(
  // P1 Revoke
  http.post('*/as/authorize', async () =>
    HttpResponse.json({
      authorizeResponse: {
        code: 123,
        state: 'NzUyNDUyMDAxOTMyNDUxNzI1NjkxNDc2MjEyMzUwMjQzMzQyMjE4OQ',
      },
    }),
  ),
  http.post('*/as/token', async () =>
    HttpResponse.json({
      access_token: 'abcdefghijklmnop',
      id_token: '0987654321',
    }),
  ),
  http.post('*/as/revoke', async () => HttpResponse.json(null, { status: 204 })),
  http.post('*/as/par', async () =>
    HttpResponse.json({ request_uri: parRequestUri, expires_in: 60 }, { status: 201 }),
  ),
  http.get('*/wellknown', async () =>
    HttpResponse.json({
      issuer: 'https://api.example.com/as/issuer',
      authorization_endpoint: 'https://api.example.com/as/authorize',
      token_endpoint: 'https://api.example.com/as/token',
      userinfo_endpoint: 'https://api.example.com/as/userinfo',
      introspection_endpoint: 'https://api.example.com/as/introspect',
      revocation_endpoint: 'https://api.example.com/as/revoke',
      pushed_authorization_request_endpoint: 'https://api.example.com/as/par',
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

  it('exposes a subscribe method', async () => {
    const oidcClient = await oidc({ config, storage: customStorageConfig });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }

    expect(oidcClient.subscribe).toBeInstanceOf(Function);
    const unsubscribe = oidcClient.subscribe(vi.fn());
    expect(unsubscribe).toBeInstanceOf(Function);
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
      expect.fail();
    }
    expect(tokens.accessToken).toBe('abcdefghijklmnop');
  });
});

describe('authorize.url() with PAR enabled', async () => {
  const configWithPar: OidcConfig = {
    clientId: '123456789',
    redirectUri: 'https://example.com/callback.html',
    scope: 'openid profile',
    serverConfig: {
      wellknown: 'https://api.example.com/wellknown',
    },
    responseType: 'code',
    par: true,
  };

  beforeEach(() => {
    customStorage.remove(storageKey);
  });

  it('returns a slim authorize URL with client_id and request_uri only', async () => {
    const oidcClient = await oidc({ config: configWithPar, storage: customStorageConfig });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }

    const url = await oidcClient.authorize.url();

    if (typeof url !== 'string') {
      expect.fail(`Expected string URL, got: ${JSON.stringify(url)}`);
    }

    const parsed = new URL(url);
    expect(parsed.searchParams.get('client_id')).toBe('123456789');
    expect(parsed.searchParams.get('request_uri')).toBe(parRequestUri);
    expect(parsed.searchParams.has('scope')).toBe(false);
    expect(parsed.searchParams.has('code_challenge')).toBe(false);
    expect(parsed.searchParams.has('redirect_uri')).toBe(false);
  });

  it('returns wellknown_error when PAR endpoint is missing from wellknown', async () => {
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          authorization_endpoint: 'https://api.example.com/as/authorize',
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
        }),
      ),
    );

    const oidcClient = await oidc({ config: configWithPar, storage: customStorageConfig });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }

    const result = await oidcClient.authorize.url();

    if (typeof result === 'string') {
      expect.fail('Expected error, got URL string');
    }
    expect(result.type).toBe('wellknown_error');
  });

  it('returns network_error when PAR endpoint returns an error', async () => {
    server.use(
      http.post('*/as/par', async () =>
        HttpResponse.json(
          { error: 'invalid_client', error_description: 'Client authentication failed' },
          { status: 400 },
        ),
      ),
    );

    const oidcClient = await oidc({ config: configWithPar, storage: customStorageConfig });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }

    const result = await oidcClient.authorize.url();

    if (typeof result === 'string') {
      expect.fail('Expected error, got URL string');
    }
    expect(result.type).toBe('network_error');
  });

  it('returns PAR_ERROR when PAR response body is a non-object (string)', async () => {
    server.use(
      http.post('*/as/par', async () => HttpResponse.json('not-an-object', { status: 201 })),
    );

    const oidcClient = await oidc({ config: configWithPar, storage: customStorageConfig });
    if ('error' in oidcClient) throw new Error('Error creating OIDC Client');

    const result = await oidcClient.authorize.url();
    if (typeof result === 'string') expect.fail('Expected error, got URL string');
    expect(result.error).toBe('PAR_ERROR');
    expect(result.type).toBe('network_error');
  });

  it('returns PAR_ERROR when PAR response body has empty request_uri', async () => {
    server.use(
      http.post('*/as/par', async () =>
        HttpResponse.json({ request_uri: '', expires_in: 60 }, { status: 201 }),
      ),
    );

    const oidcClient = await oidc({ config: configWithPar, storage: customStorageConfig });
    if ('error' in oidcClient) throw new Error('Error creating OIDC Client');

    const result = await oidcClient.authorize.url();
    if (typeof result === 'string') expect.fail('Expected error, got URL string');
    expect(result.error).toBe('PAR_ERROR');
    expect(result.type).toBe('network_error');
  });
});

describe('authorize.background() dispatch error branches', async () => {
  const standardConfig: OidcConfig = {
    clientId: '123456789',
    redirectUri: 'https://example.com/callback.html',
    scope: 'openid profile',
    serverConfig: {
      wellknown: 'https://api.example.com/wellknown',
    },
    responseType: 'code',
  };

  beforeEach(() => {
    customStorage.remove(storageKey);
  });

  it('surfaces CONFIGURATION_ERROR without a redirectUrl', async () => {
    server.use(
      http.post('*/as/authorize', async () =>
        HttpResponse.json(
          { error: 'invalid_request', error_description: 'misconfigured client' },
          { status: 400 },
        ),
      ),
    );

    const oidcClient = await oidc({ config: standardConfig, storage: customStorageConfig });
    if ('error' in oidcClient) throw new Error('Error creating OIDC Client');

    const result = await oidcClient.authorize.background();
    if (!('error' in result)) expect.fail('Expected error, got success');

    expect(result.error).toBe('CONFIGURATION_ERROR');
    expect(result.type).toBe('network_error');
    expect('redirectUrl' in result).toBe(false);
  });

  it('builds redirectUrl for non-configuration authorize errors (details array)', async () => {
    server.use(
      http.post('*/as/authorize', async () =>
        HttpResponse.json(
          {
            details: [{ code: 'access_denied', message: 'user denied consent' }],
          },
          { status: 403 },
        ),
      ),
    );

    const oidcClient = await oidc({ config: standardConfig, storage: customStorageConfig });
    if ('error' in oidcClient) throw new Error('Error creating OIDC Client');

    const result = await oidcClient.authorize.background();
    if (!('error' in result)) expect.fail('Expected error, got success');

    expect(result.error).toBe('access_denied');
    expect(result.type).toBe('auth_error');
    expect('redirectUrl' in result).toBe(true);
    if ('redirectUrl' in result) {
      expect(typeof result.redirectUrl).toBe('string');
      expect(result.redirectUrl).toContain('authorize');
    }
  });

  it('returns Unknown_Error when authorize response body lacks authorizeResponse', async () => {
    server.use(
      http.post('*/as/authorize', async () =>
        HttpResponse.json({ unexpected: 'shape' }, { status: 200 }),
      ),
    );

    const oidcClient = await oidc({ config: standardConfig, storage: customStorageConfig });
    if ('error' in oidcClient) throw new Error('Error creating OIDC Client');

    const result = await oidcClient.authorize.background();
    if (!('error' in result)) expect.fail('Expected error, got success');

    expect(result.error).toBe('Unknown_Error');
    expect(result.type).toBe('unknown_error');
  });
});

describe('PAR factory validation', async () => {
  it('returns argument_error when wellknown requires PAR but config.par is explicitly false', async () => {
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          authorization_endpoint: 'https://api.example.com/as/authorize',
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
          pushed_authorization_request_endpoint: 'https://api.example.com/as/par',
          require_pushed_authorization_requests: true,
        }),
      ),
    );

    const configParFalse: OidcConfig = {
      clientId: '123456789',
      redirectUri: 'https://example.com/callback.html',
      scope: 'openid profile',
      serverConfig: { wellknown: 'https://api.example.com/wellknown' },
      responseType: 'code',
      par: false,
    };

    const result = await oidc({ config: configParFalse, storage: customStorageConfig });

    if (!('error' in result)) {
      expect.fail('Expected error, got client');
    }
    expect(result.type).toBe('argument_error');
  });

  it('succeeds when wellknown requires PAR and config.par is true', async () => {
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          authorization_endpoint: 'https://api.example.com/as/authorize',
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
          pushed_authorization_request_endpoint: 'https://api.example.com/as/par',
          require_pushed_authorization_requests: true,
        }),
      ),
    );

    const configParTrue: OidcConfig = {
      clientId: '123456789',
      redirectUri: 'https://example.com/callback.html',
      scope: 'openid profile',
      serverConfig: { wellknown: 'https://api.example.com/wellknown' },
      responseType: 'code',
      par: true,
    };

    const result = await oidc({ config: configParTrue, storage: customStorageConfig });
    expect('error' in result).toBe(false);
  });

  it('succeeds when wellknown requires PAR and config.par is unset (implicit opt-in)', async () => {
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          authorization_endpoint: 'https://api.example.com/as/authorize',
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
          pushed_authorization_request_endpoint: 'https://api.example.com/as/par',
          require_pushed_authorization_requests: true,
        }),
      ),
    );

    const configParUnset: OidcConfig = {
      clientId: '123456789',
      redirectUri: 'https://example.com/callback.html',
      scope: 'openid profile',
      serverConfig: { wellknown: 'https://api.example.com/wellknown' },
      responseType: 'code',
    };

    const result = await oidc({ config: configParUnset, storage: customStorageConfig });
    expect('error' in result).toBe(false);
  });

  it('uses PAR when wellknown requires it and config.par is unset', async () => {
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          authorization_endpoint: 'https://api.example.com/as/authorize',
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
          pushed_authorization_request_endpoint: 'https://api.example.com/as/par',
          require_pushed_authorization_requests: true,
        }),
      ),
    );

    const configParUnset: OidcConfig = {
      clientId: '123456789',
      redirectUri: 'https://example.com/callback.html',
      scope: 'openid profile',
      serverConfig: { wellknown: 'https://api.example.com/wellknown' },
      responseType: 'code',
      // par deliberately omitted
    };

    const result = await oidc({ config: configParUnset, storage: customStorageConfig });

    if ('error' in result) {
      expect.fail('Expected client, got error');
    }

    const url = await result.authorize.url();

    if (typeof url !== 'string') {
      expect.fail(`Expected string URL, got: ${JSON.stringify(url)}`);
    }

    const parsed = new URL(url);
    expect(parsed.searchParams.has('request_uri')).toBe(true);
    expect(parsed.searchParams.has('client_id')).toBe(true);
    expect(parsed.searchParams.has('scope')).toBe(false);
    expect(parsed.searchParams.has('code_challenge')).toBe(false);
  });
});

describe('authorize.background() with PAR enabled', async () => {
  const configWithPar: OidcConfig = {
    clientId: '123456789',
    redirectUri: 'https://example.com/callback.html',
    scope: 'openid profile',
    serverConfig: { wellknown: 'https://api.example.com/wellknown' },
    responseType: 'code',
    par: true,
  };

  beforeEach(() => {
    customStorage.remove(storageKey);
  });

  it('uses slim PAR authorize URL for pi.flow background request', async () => {
    const result = await oidc({ config: configWithPar, storage: customStorageConfig });

    if ('error' in result) {
      expect.fail('Expected client, got error');
    }

    const response = await result.authorize.background({
      clientId: configWithPar.clientId,
      redirectUri: configWithPar.redirectUri,
      scope: configWithPar.scope,
      responseType: 'code',
      responseMode: 'pi.flow',
    });

    if ('error' in response) {
      expect.fail(`Expected success, got error: ${JSON.stringify(response)}`);
    }

    expect(response.code).toBeDefined();
    expect(response.state).toBeDefined();
  });
});

describe('authorize.url() with PAR enabled on non-pi.flow server', async () => {
  beforeEach(() => {
    customStorage.remove(storageKey);
  });

  it('returns slim PAR authorize URL for iframe-based server', async () => {
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          authorization_endpoint: 'https://api.example.com/as/authorize',
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
          pushed_authorization_request_endpoint: 'https://api.example.com/as/par',
          response_types_supported: ['code', 'token', 'id_token', 'code id_token'],
          response_modes_supported: ['query', 'fragment', 'form_post'],
        }),
      ),
    );

    const configWithPar: OidcConfig = {
      clientId: '123456789',
      redirectUri: 'https://example.com/callback.html',
      scope: 'openid profile',
      serverConfig: { wellknown: 'https://api.example.com/wellknown' },
      responseType: 'code',
      par: true,
    };

    const oidcClient = await oidc({ config: configWithPar, storage: customStorageConfig });

    if ('error' in oidcClient) {
      throw new Error('Error creating OIDC Client');
    }

    const url = await oidcClient.authorize.url();

    if (typeof url !== 'string') {
      expect.fail(`Expected string URL, got: ${JSON.stringify(url)}`);
    }

    const parsed = new URL(url);
    expect(parsed.searchParams.get('client_id')).toBe('123456789');
    expect(parsed.searchParams.get('request_uri')).toBe(parRequestUri);
    expect(parsed.searchParams.has('scope')).toBe(false);
    expect(parsed.searchParams.has('code_challenge')).toBe(false);
    expect(parsed.searchParams.has('redirect_uri')).toBe(false);
  });
});

describe('user.session()', async () => {
  const config: OidcConfig = {
    clientId: '123456789',
    redirectUri: 'https://example.com/callback.html',
    scope: 'openid profile',
    serverConfig: {
      wellknown: 'https://api.example.com/wellknown',
    },
    responseType: 'code',
  };

  beforeEach(() => {
    customStorage.remove(storageKey);
  });

  it('returns a GenericError when no tokens are stored', async () => {
    // response_type=none requires a stored id_token; failing before dispatch.
    const oidcClient = await oidc({ config, storage: customStorageConfig });
    if ('error' in oidcClient) throw new Error('Error creating OIDC Client');

    const result = await oidcClient.user.session();

    if (!('error' in result)) {
      expect.fail('Expected SessionCheckError, got success');
    }
    expect(result.error).toBe('no_id_token_hint');
    expect(result.type).toBe('argument_error');
  });

  it('returns wellknown_error when authorization_endpoint is missing from the wellknown config', async () => {
    // When authorization_endpoint is missing, initWellknownQuery validates and returns an error,
    // so oidc() itself returns a wellknown_error at factory initialization time.
    server.use(
      http.get('*/wellknown', async () =>
        HttpResponse.json({
          issuer: 'https://api.example.com/as/issuer',
          // authorization_endpoint deliberately omitted — causes wellknown validation to fail
          token_endpoint: 'https://api.example.com/as/token',
          userinfo_endpoint: 'https://api.example.com/as/userinfo',
          introspection_endpoint: 'https://api.example.com/as/introspect',
          revocation_endpoint: 'https://api.example.com/as/revoke',
        }),
      ),
    );

    const result = await oidc({ config, storage: customStorageConfig });

    // The factory itself surfaces a wellknown_error when the wellknown response is invalid
    if (!('error' in result)) {
      expect.fail('Expected wellknown_error, got client');
    }
    expect(result.type).toBe('wellknown_error');
  });
});
