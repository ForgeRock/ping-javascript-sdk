/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { it, expect } from '@effect/vitest';
import { Micro } from 'effect';
import { vi, afterEach } from 'vitest';
import * as sdkOidc from '@forgerock/sdk-oidc';
import { createParAuthorizeUrlµ, authorizeµ } from './authorize.request.js';
import {
  toAuthorizationError,
  isFetchBaseQueryError,
  toDispatchError,
  isStringRecord,
  hasPushRequestUri,
  buildAuthorizeOptions,
  buildParAuthorizeUrl,
} from './authorize.request.utils.js';
import type { OidcConfig } from './config.types.js';
import type { WellknownResponse } from '@forgerock/sdk-types';
import type { ClientStore } from './client.types.js';

const clientId = '123456789';
const redirectUri = 'https://example.com/callback.html';
const scope = 'openid profile';
const responseType = 'code';
const config: OidcConfig = {
  clientId,
  redirectUri,
  scope,
  serverConfig: {
    wellknown: 'https://example.com/wellknown',
  },
  responseType,
};
const wellknown: WellknownResponse = {
  issuer: 'https://example.com/issuer',
  authorization_endpoint: 'https://example.com/authorize',
  token_endpoint: 'https://example.com/token',
  userinfo_endpoint: 'https://example.com/userinfo',
  end_session_endpoint: 'https://example.com/endSession',
  introspection_endpoint: 'https://example.com/introspect',
  revocation_endpoint: 'https://example.com/revoke',
};

const parEndpoint = 'https://example.com/par';
const wellknownWithPar: WellknownResponse = {
  ...wellknown,
  pushed_authorization_request_endpoint: parEndpoint,
};

const mockStore = {
  dispatch: vi.fn(),
} as unknown as ClientStore;

const mockLog = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
} as unknown as import('@forgerock/sdk-logger').CustomLogger;

const sessionStorageStub = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── toAuthorizationError ────────────────────────────────────────────────────

it('toAuthorizationError returns error shape from valid object', () => {
  const result = toAuthorizationError({
    error: 'access_denied',
    error_description: 'denied',
    type: 'auth_error',
  });
  expect(result).toStrictEqual({
    error: 'access_denied',
    error_description: 'denied',
    type: 'auth_error',
  });
});

it('toAuthorizationError returns Unknown_Error for missing error field', () => {
  const result = toAuthorizationError({ error_description: 'no error key' });
  expect(result.error).toBe('Unknown_Error');
  expect(result.type).toBe('unknown_error');
});

it('toAuthorizationError returns Unknown_Error for non-object input', () => {
  const result = toAuthorizationError(null);
  expect(result.error).toBe('Unknown_Error');
});

// ─── isFetchBaseQueryError ───────────────────────────────────────────────────

it('isFetchBaseQueryError returns true for FetchBaseQueryError', () => {
  expect(isFetchBaseQueryError({ status: 400, data: {} })).toBe(true);
});

it('isFetchBaseQueryError returns false for SerializedError', () => {
  expect(isFetchBaseQueryError({ message: 'oops', code: 'ERR' })).toBe(false);
});

// ─── toDispatchError ─────────────────────────────────────────────────────────

it('toDispatchError uses code/message for SerializedError', () => {
  const result = toDispatchError({ code: 'NETWORK_ERR', message: 'fetch failed' });
  expect(result).toStrictEqual({
    error: 'NETWORK_ERR',
    error_description: 'fetch failed',
    type: 'unknown_error',
  });
});

it('toDispatchError delegates to toAuthorizationError for FetchBaseQueryError', () => {
  const result = toDispatchError({
    status: 400,
    data: { error: 'invalid_client', error_description: 'bad creds', type: 'auth_error' },
  });
  expect(result).toStrictEqual({
    error: 'invalid_client',
    error_description: 'bad creds',
    type: 'auth_error',
  });
});

// ─── createParAuthorizeUrlµ ───────────────────────────────────────────────────────────

it.effect('createParAuthorizeUrlµ fails with PAR_NOT_CONFIGURED when par endpoint is missing', () =>
  Micro.gen(function* () {
    const configWithPar: OidcConfig = { ...config, par: true };
    const result = yield* Micro.exit(
      createParAuthorizeUrlµ(wellknown, configWithPar, mockLog, mockStore),
    );
    expect(Micro.exitIsFailure(result)).toBe(true);
    if (!Micro.exitIsFailure(result)) return;
    expect(Micro.causeIsFail(result.cause)).toBe(true);
    if (Micro.causeIsFail(result.cause)) {
      expect(result.cause.error.error).toBe('PAR_NOT_CONFIGURED');
      expect(result.cause.error.type).toBe('wellknown_error');
      expect(result.cause.error.error_description).toBe(
        'PAR endpoint not found in server configuration',
      );
    }
  }),
);

it.effect('createParAuthorizeUrlµ succeeds and returns slim authorize URL', () =>
  Micro.gen(function* () {
    const configWithPar: OidcConfig = { ...config, par: true };
    const requestUri = 'urn:ietf:params:oauth:request_uri:abc123';

    vi.stubGlobal('sessionStorage', sessionStorageStub);
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      data: { request_uri: requestUri, expires_in: 60 },
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const url = yield* createParAuthorizeUrlµ(wellknownWithPar, configWithPar, mockLog, mockStore);

    expect(url).toContain('client_id=123456789');
    expect(url).toContain(`request_uri=${encodeURIComponent(requestUri)}`);
    expect(url).not.toContain('scope=');
    expect(url).not.toContain('code_challenge=');
    expect(sessionStorageStub.setItem).toHaveBeenCalled();
  }),
);

it.effect('createParAuthorizeUrlµ fails with network_error when PAR POST returns error', () =>
  Micro.gen(function* () {
    const configWithPar: OidcConfig = { ...config, par: true };

    vi.stubGlobal('sessionStorage', sessionStorageStub);
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      error: {
        status: 400,
        statusText: 'PAR_ERROR',
        data: { error: 'PAR_ERROR', error_description: 'invalid_client', type: 'network_error' },
      },
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const result = yield* Micro.exit(
      createParAuthorizeUrlµ(wellknownWithPar, configWithPar, mockLog, mockStore),
    );

    expect(Micro.exitIsFailure(result)).toBe(true);
    if (!Micro.exitIsFailure(result)) return;
    expect(Micro.causeIsFail(result.cause)).toBe(true);
    if (Micro.causeIsFail(result.cause)) {
      expect(result.cause.error.type).toBe('network_error');
    }
    expect(sessionStorageStub.setItem).not.toHaveBeenCalled();
  }),
);

it.effect(
  'createParAuthorizeUrlµ fails with network_error when PAR response is missing request_uri',
  () =>
    Micro.gen(function* () {
      const configWithPar: OidcConfig = { ...config, par: true };

      vi.stubGlobal('sessionStorage', sessionStorageStub);
      vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
        data: {},
      } as unknown as ReturnType<typeof mockStore.dispatch>);

      const result = yield* Micro.exit(
        createParAuthorizeUrlµ(wellknownWithPar, configWithPar, mockLog, mockStore),
      );

      expect(Micro.exitIsFailure(result)).toBe(true);
      if (!Micro.exitIsFailure(result)) return;
      expect(Micro.causeIsFail(result.cause)).toBe(true);
      if (Micro.causeIsFail(result.cause)) {
        expect(result.cause.error.type).toBe('network_error');
        expect(result.cause.error.error_description).toBe(
          "PAR response missing required 'request_uri' field",
        );
      }
      expect(sessionStorageStub.setItem).not.toHaveBeenCalled();
    }),
);

it.effect(
  'createParAuthorizeUrlµ with prompt=none includes prompt on slim authorize URL and in PAR body',
  () =>
    Micro.gen(function* () {
      const configWithPar: OidcConfig = { ...config, par: true };
      const requestUri = 'urn:ietf:params:oauth:request_uri:prompt-none-test';

      vi.stubGlobal('sessionStorage', sessionStorageStub);

      const buildParamsSpy = vi.spyOn(sdkOidc, 'buildAuthorizeParams');

      vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
        data: { request_uri: requestUri, expires_in: 60 },
      } as unknown as ReturnType<typeof mockStore.dispatch>);

      const url = yield* createParAuthorizeUrlµ(
        wellknownWithPar,
        configWithPar,
        mockLog,
        mockStore,
        {
          prompt: 'none',
        },
      );

      expect(url).toContain('prompt=none');
      const parBodyArg = buildParamsSpy.mock.calls[0][0] as unknown as Record<string, unknown>;
      expect(parBodyArg.prompt).toBe('none');
    }),
);

// ─── isStringRecord ──────────────────────────────────────────────────────────

it('isStringRecord returns true for plain objects', () => {
  expect(isStringRecord({ a: 1 })).toBe(true);
  expect(isStringRecord({})).toBe(true);
});

it('isStringRecord returns false for non-objects', () => {
  expect(isStringRecord(null)).toBe(false);
  expect(isStringRecord('string')).toBe(false);
  expect(isStringRecord(42)).toBe(false);
  expect(isStringRecord(undefined)).toBe(false);
  expect(isStringRecord([])).toBe(true); // arrays are objects — intentional
});

// ─── hasPushRequestUri ───────────────────────────────────────────────────────

it('hasPushRequestUri returns true when request_uri is a string', () => {
  expect(hasPushRequestUri({ request_uri: 'urn:ietf:params:oauth:request_uri:abc' })).toBe(true);
});

it('hasPushRequestUri returns false when request_uri is missing', () => {
  expect(hasPushRequestUri({})).toBe(false);
  expect(hasPushRequestUri({ request_uri: 123 })).toBe(false);
  expect(hasPushRequestUri(null)).toBe(false);
  expect(hasPushRequestUri('string')).toBe(false);
});

// ─── validateParResponseµ ────────────────────────────────────────────────────

import { validateParResponseµ } from './authorize.request.micros.js';

it.effect('validateParResponseµ with SerializedError preserves error message', () =>
  Micro.gen(function* () {
    const serializedError = { name: 'Error', message: 'network timeout', code: 'FETCH_ERROR' };
    const exit = yield* Micro.exit(validateParResponseµ({ error: serializedError }));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    // Should surface the actual message, not generic "Unknown_Error"
    expect(exit.cause.error.error_description).toContain('network timeout');
  }),
);

// ─── buildParAuthorizeUrl ────────────────────────────────────────────────────

it('buildParAuthorizeUrl produces slim URL with client_id and request_uri', () => {
  const url = buildParAuthorizeUrl({
    authorizationEndpoint: 'https://example.com/authorize',
    clientId: 'my-client',
    requestUri: 'urn:ietf:params:oauth:request_uri:xyz',
  });

  const parsed = new URL(url);
  expect(parsed.searchParams.get('client_id')).toBe('my-client');
  expect(parsed.searchParams.get('request_uri')).toBe('urn:ietf:params:oauth:request_uri:xyz');
  expect(parsed.searchParams.has('scope')).toBe(false);
  expect(parsed.searchParams.has('code_challenge')).toBe(false);
});

it('buildParAuthorizeUrl includes prompt when provided', () => {
  const url = buildParAuthorizeUrl({
    authorizationEndpoint: 'https://example.com/authorize',
    clientId: 'my-client',
    requestUri: 'urn:ietf:params:oauth:request_uri:xyz',
    prompt: 'login',
  });

  expect(new URL(url).searchParams.get('prompt')).toBe('login');
});

it('buildParAuthorizeUrl omits prompt when not provided', () => {
  const url = buildParAuthorizeUrl({
    authorizationEndpoint: 'https://example.com/authorize',
    clientId: 'my-client',
    requestUri: 'urn:ietf:params:oauth:request_uri:xyz',
  });

  expect(new URL(url).searchParams.has('prompt')).toBe(false);
});

// ─── buildAuthorizeOptions ────────────────────────────────────────────────────

it('buildAuthorizeOptions returns path and merged options from config', () => {
  const wk: WellknownResponse = { ...wellknown };
  const [path, opts] = buildAuthorizeOptions(wk, config);

  expect(path).toBe(wk.authorization_endpoint);
  expect(opts.clientId).toBe(config.clientId);
  expect(opts.redirectUri).toBe(config.redirectUri);
  expect(opts.scope).toBe(config.scope);
  expect(opts.responseType).toBe(config.responseType);
  // pi.flow should NOT be set when response_modes_supported is absent
  expect(opts.responseMode).toBeUndefined();
});

it('buildAuthorizeOptions adds pi.flow responseMode when server supports it', () => {
  const wkWithPiFlow: WellknownResponse = {
    ...wellknown,
    response_modes_supported: ['query', 'pi.flow'],
  };
  const [, opts] = buildAuthorizeOptions(wkWithPiFlow, config);
  expect(opts.responseMode).toBe('pi.flow');
});

it('buildAuthorizeOptions merges caller options and lets them override defaults', () => {
  const [, opts] = buildAuthorizeOptions(wellknown, config, { scope: 'openid email' });
  expect(opts.scope).toBe('openid email');
});

it('buildAuthorizeOptions falls back to "openid" scope and "code" responseType when config omits them', () => {
  const minimal = {
    clientId,
    redirectUri,
    serverConfig: config.serverConfig,
  } as unknown as OidcConfig;
  const [, opts] = buildAuthorizeOptions(wellknown, minimal);
  expect(opts.scope).toBe('openid');
  expect(opts.responseType).toBe('code');
});

// ─── authorizeµ flow routing ──────────────────────────────────────────────────

it.effect('authorizeµ uses PAR flow when useParFlow=true', () =>
  Micro.gen(function* () {
    const requestUri = 'urn:ietf:params:oauth:request_uri:par-routing-test';
    const authorizeResponse = { code: 'par-code', state: 'par-state' };

    vi.stubGlobal('sessionStorage', sessionStorageStub);
    // First dispatch: PAR POST → returns request_uri
    vi.mocked(mockStore.dispatch)
      .mockResolvedValueOnce({
        data: { request_uri: requestUri, expires_in: 60 },
      } as unknown as ReturnType<typeof mockStore.dispatch>)
      // Second dispatch: authorize iframe/fetch → returns code+state
      .mockResolvedValueOnce({
        data: authorizeResponse,
      } as unknown as ReturnType<typeof mockStore.dispatch>);

    const result = yield* authorizeµ(wellknownWithPar, config, mockLog, mockStore, undefined, true);
    expect(result).toStrictEqual(authorizeResponse);
    // PAR POST + authorize dispatch = 2 calls
    expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
  }),
);

it.effect('authorizeµ uses standard flow when useParFlow=false', () =>
  Micro.gen(function* () {
    const authorizeResponse = { code: 'std-code', state: 'std-state' };

    vi.stubGlobal('sessionStorage', sessionStorageStub);
    vi.spyOn(sdkOidc, 'createAuthorizeUrl').mockResolvedValue(
      'https://example.com/authorize?code_challenge=xxx',
    );
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      data: authorizeResponse,
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const result = yield* authorizeµ(wellknown, config, mockLog, mockStore, undefined, false);
    expect(result).toStrictEqual(authorizeResponse);
    // Only one dispatch: the iframe/fetch call (no PAR POST)
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
  }),
);

it.effect('authorizeµ defaults to PAR when wellknown requires it and useParFlow not passed', () =>
  Micro.gen(function* () {
    const requestUri = 'urn:ietf:params:oauth:request_uri:required-par-test';
    const authorizeResponse = { code: 'req-par-code', state: 'req-par-state' };
    const wkRequiresPar: WellknownResponse = {
      ...wellknownWithPar,
      require_pushed_authorization_requests: true,
    };

    vi.stubGlobal('sessionStorage', sessionStorageStub);
    vi.mocked(mockStore.dispatch)
      .mockResolvedValueOnce({
        data: { request_uri: requestUri, expires_in: 60 },
      } as unknown as ReturnType<typeof mockStore.dispatch>)
      .mockResolvedValueOnce({
        data: authorizeResponse,
      } as unknown as ReturnType<typeof mockStore.dispatch>);

    const result = yield* authorizeµ(wkRequiresPar, config, mockLog, mockStore);
    expect(result).toStrictEqual(authorizeResponse);
    expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
  }),
);

it.effect(
  'authorizeµ routes to pi.flow fetch when options.responseMode is pi.flow (unwraps authorizeResponse)',
  () =>
    Micro.gen(function* () {
      // pi.flow dispatch goes through dispatchAuthorizeFetch which unwraps { authorizeResponse }
      const requestUri = 'urn:ietf:params:oauth:request_uri:pi-flow-test';
      const authorizeResponse = { code: 'pi-code', state: 'pi-state' };

      vi.stubGlobal('sessionStorage', sessionStorageStub);
      vi.mocked(mockStore.dispatch)
        .mockResolvedValueOnce({
          data: { request_uri: requestUri, expires_in: 60 },
        } as unknown as ReturnType<typeof mockStore.dispatch>)
        .mockResolvedValueOnce({
          data: { authorizeResponse },
        } as unknown as ReturnType<typeof mockStore.dispatch>);

      const result = yield* authorizeµ(
        wellknownWithPar,
        config,
        mockLog,
        mockStore,
        {
          clientId,
          redirectUri,
          scope,
          responseType: 'code' as const,
          responseMode: 'pi.flow' as const,
        },
        true,
      );
      expect(result).toStrictEqual(authorizeResponse);
    }),
);
