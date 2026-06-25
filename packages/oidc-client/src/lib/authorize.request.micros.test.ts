/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, it } from '@effect/vitest';
import * as sdkOidc from '@forgerock/sdk-oidc';
import * as sdkUtilities from '@forgerock/sdk-utilities';
import { Micro } from 'effect';
import { afterEach, vi } from 'vitest';

import {
  buildParBodyµ,
  buildParSlimUrlµ,
  createAuthorizeUrlµ,
  dispatchAuthorizeFetchµ,
  dispatchAuthorizeIframeµ,
  generateAuthValuesµ,
  generatePkceChallengeµ,
  handleDispatchErrorµ,
  storeAuthOptionsµ,
  validateParResponseµ,
} from './authorize.request.micros.js';

import type { GetAuthorizationUrlOptions, WellknownResponse } from '@forgerock/sdk-types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { ClientStore } from './client.types.js';
import type { OidcConfig } from './config.types.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const clientId = 'test-client-id';
const redirectUri = 'https://example.com/callback.html';
const scope = 'openid profile';
const responseType = 'code';
const config: OidcConfig = {
  clientId,
  redirectUri,
  scope,
  responseType,
  serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
};
const wellknown: WellknownResponse = {
  issuer: 'https://example.com',
  authorization_endpoint: 'https://example.com/authorize',
  token_endpoint: 'https://example.com/token',
  userinfo_endpoint: 'https://example.com/userinfo',
  end_session_endpoint: 'https://example.com/logout',
  introspection_endpoint: 'https://example.com/introspect',
  revocation_endpoint: 'https://example.com/revoke',
};
const mockStore = { dispatch: vi.fn() } as unknown as ClientStore;
const sessionStorageStub = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── generateAuthValuesµ ───────────────────────────────────────────────────────

it.effect('generateAuthValuesµ returns auth URL options and store function', () =>
  Micro.gen(function* () {
    vi.stubGlobal('sessionStorage', sessionStorageStub);
    const result = yield* generateAuthValuesµ(config, wellknown);
    const [opts, storeFn] = result;
    expect(opts.clientId).toBe(clientId);
    expect(typeof opts.state).toBe('string');
    expect(typeof opts.verifier).toBe('string');
    expect(typeof storeFn).toBe('function');
  }),
);

it.effect('generateAuthValuesµ fails with auth_error when sessionStorage throws', () =>
  Micro.gen(function* () {
    vi.spyOn(sdkOidc, 'generateAndStoreAuthUrlValues').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const exit = yield* Micro.exit(generateAuthValuesµ(config, wellknown));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('auth_error');
    expect(exit.cause.error.error).toBe('PAR_PARAM_BUILD_ERROR');
  }),
);

// ─── generatePkceChallengeµ ────────────────────────────────────────────────────

it.effect('generatePkceChallengeµ returns a non-empty challenge string', () =>
  Micro.gen(function* () {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      },
      getRandomValues: vi.fn((arr: Uint8Array) => arr.fill(1)),
    });
    const challenge = yield* generatePkceChallengeµ('test-verifier');
    expect(typeof challenge).toBe('string');
    expect(challenge.length).toBeGreaterThan(0);
  }),
);

it.effect('generatePkceChallengeµ fails with auth_error when createChallenge throws', () =>
  Micro.gen(function* () {
    vi.spyOn(sdkUtilities, 'createChallenge').mockRejectedValue(new Error('crypto unavailable'));
    const exit = yield* Micro.exit(generatePkceChallengeµ('bad-verifier'));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('auth_error');
    expect(exit.cause.error.error).toBe('PAR_CHALLENGE_ERROR');
  }),
);

// ─── buildParBodyµ ─────────────────────────────────────────────────────────────

it.effect('buildParBodyµ returns URLSearchParams with expected fields', () =>
  Micro.gen(function* () {
    const params = yield* buildParBodyµ(config, {}, 'challenge-abc', 'state-xyz');
    expect(params.get('client_id')).toBe(clientId);
    expect(params.get('code_challenge')).toBe('challenge-abc');
    expect(params.get('state')).toBe('state-xyz');
    expect(params.get('scope')).toBe(scope);
    expect(params.has('prompt')).toBe(false);
  }),
);

it.effect('buildParBodyµ includes prompt when provided', () =>
  Micro.gen(function* () {
    const params = yield* buildParBodyµ(config, {}, 'challenge-abc', 'state-xyz', 'login');
    expect(params.get('prompt')).toBe('login');
  }),
);

it.effect('buildParBodyµ fails with auth_error when buildAuthorizeParams throws', () =>
  Micro.gen(function* () {
    vi.spyOn(sdkOidc, 'buildAuthorizeParams').mockImplementation(() => {
      throw new Error('build failed');
    });
    const exit = yield* Micro.exit(buildParBodyµ(config, {}, 'ch', 'st'));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('auth_error');
    expect(exit.cause.error.error).toBe('PAR_PARAM_BUILD_ERROR');
  }),
);

// ─── buildParSlimUrlµ ──────────────────────────────────────────────────────────

it.effect('buildParSlimUrlµ returns URL with only client_id and request_uri', () =>
  Micro.gen(function* () {
    const url = yield* buildParSlimUrlµ(
      wellknown.authorization_endpoint,
      clientId,
      'urn:ietf:params:oauth:request_uri:abc123',
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get('client_id')).toBe(clientId);
    expect(parsed.searchParams.get('request_uri')).toBe('urn:ietf:params:oauth:request_uri:abc123');
    expect(parsed.searchParams.has('scope')).toBe(false);
  }),
);

it.effect('buildParSlimUrlµ includes prompt when provided', () =>
  Micro.gen(function* () {
    const url = yield* buildParSlimUrlµ(
      wellknown.authorization_endpoint,
      clientId,
      'urn:ietf:params:oauth:request_uri:abc123',
      'none',
    );
    expect(new URL(url).searchParams.get('prompt')).toBe('none');
  }),
);

// ─── storeAuthOptionsµ ─────────────────────────────────────────────────────────

it.effect('storeAuthOptionsµ calls the provided store function', () =>
  Micro.gen(function* () {
    const storeFn = vi.fn();
    yield* storeAuthOptionsµ(storeFn);
    expect(storeFn).toHaveBeenCalledOnce();
  }),
);

it.effect('storeAuthOptionsµ fails with unknown_error when store function throws', () =>
  Micro.gen(function* () {
    const exit = yield* Micro.exit(
      storeAuthOptionsµ(() => {
        throw new Error('storage write failed');
      }),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('unknown_error');
    expect(exit.cause.error.error).toBe('PAR_STORAGE_ERROR');
  }),
);

// ─── validateParResponseµ ──────────────────────────────────────────────────────

it.effect('validateParResponseµ succeeds when request_uri is present', () =>
  Micro.gen(function* () {
    const result = yield* validateParResponseµ({
      data: { request_uri: 'urn:ietf:params:oauth:request_uri:xyz', expires_in: 60 },
    });
    expect(result.request_uri).toBe('urn:ietf:params:oauth:request_uri:xyz');
  }),
);

it.effect('validateParResponseµ fails with network_error on RTK error', () =>
  Micro.gen(function* () {
    const exit = yield* Micro.exit(
      validateParResponseµ({
        error: {
          status: 400,
          data: { error: 'invalid_client', error_description: 'bad creds', type: 'auth_error' },
        },
      }),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.error).toBe('invalid_client');
  }),
);

it.effect('validateParResponseµ fails with network_error when request_uri is absent', () =>
  Micro.gen(function* () {
    const exit = yield* Micro.exit(validateParResponseµ({ data: { expires_in: 60 } }));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('network_error');
    expect(exit.cause.error.error_description).toContain('request_uri');
  }),
);

// ─── createAuthorizeUrlµ ──────────────────────────────────────────────────

it.effect('createAuthorizeUrlµ returns [url, options] tuple', () =>
  Micro.gen(function* () {
    vi.stubGlobal('sessionStorage', sessionStorageStub);
    const opts = {
      clientId,
      redirectUri,
      scope,
      responseType: 'code' as const,
      state: 'test-state',
      verifier: 'test-verifier',
    };
    vi.spyOn(sdkOidc, 'createAuthorizeUrl').mockResolvedValue(
      'https://example.com/authorize?foo=bar',
    );
    const [url, returnedOpts] = yield* createAuthorizeUrlµ(wellknown.authorization_endpoint, opts);
    expect(url).toBe('https://example.com/authorize?foo=bar');
    expect(returnedOpts).toBe(opts);
  }),
);

it.effect('createAuthorizeUrlµ fails with auth_error when createAuthorizeUrl rejects', () =>
  Micro.gen(function* () {
    vi.spyOn(sdkOidc, 'createAuthorizeUrl').mockRejectedValue(new Error('url build failed'));
    const exit = yield* Micro.exit(
      createAuthorizeUrlµ(wellknown.authorization_endpoint, {
        clientId,
        redirectUri,
        scope,
        responseType,
      }),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('auth_error');
    expect(exit.cause.error.error).toBe('AuthorizationUrlError');
  }),
);

// ─── handleDispatchErrorµ ──────────────────────────────────────────────────────

it.effect('handleDispatchErrorµ fails immediately for CONFIGURATION_ERROR', () =>
  Micro.gen(function* () {
    const exit = yield* Micro.exit(
      handleDispatchErrorµ(
        {
          status: 'CUSTOM_ERROR',
          statusText: 'CONFIGURATION_ERROR',
          error: 'config error',
          data: undefined,
        } as FetchBaseQueryError,
        wellknown,
        { clientId, redirectUri, scope, responseType },
      ),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('unknown_error');
  }),
);

it.effect('handleDispatchErrorµ builds redirect URL for non-config errors', () =>
  Micro.gen(function* () {
    vi.spyOn(sdkOidc, 'createAuthorizeUrl').mockResolvedValue(
      'https://example.com/authorize?error=login_required',
    );
    const exit = yield* Micro.exit(
      handleDispatchErrorµ(
        {
          status: 400,
          data: {
            error: 'login_required',
            error_description: 'User must authenticate',
            type: 'auth_error',
          },
        },
        wellknown,
        { clientId, redirectUri, scope, responseType },
      ),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.error).toBe('login_required');
    expect(exit.cause.error).toHaveProperty('redirectUrl');
  }),
);

// ─── dispatchAuthorizeFetchµ ───────────────────────────────────────────────────

it.effect('dispatchAuthorizeFetchµ succeeds with authorizeResponse', () =>
  Micro.gen(function* () {
    const authorizeResponse = { code: 'auth-code-abc', state: 'state-xyz' };
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      data: { authorizeResponse },
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const result = yield* dispatchAuthorizeFetchµ(
      mockStore,
      'https://example.com/authorize?request_uri=...',
      wellknown,
      { clientId, redirectUri, scope, responseType },
    );
    expect(result).toStrictEqual(authorizeResponse);
  }),
);

it.effect(
  'dispatchAuthorizeFetchµ fails with unknown_error when data has no authorizeResponse',
  () =>
    Micro.gen(function* () {
      vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
        data: {},
      } as unknown as ReturnType<typeof mockStore.dispatch>);

      const exit = yield* Micro.exit(
        dispatchAuthorizeFetchµ(mockStore, 'https://example.com/authorize', wellknown, {
          clientId,
          redirectUri,
          scope,
          responseType,
        }),
      );
      expect(Micro.exitIsFailure(exit)).toBe(true);
      if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
      expect(exit.cause.error.type).toBe('unknown_error');
    }),
);

// ─── dispatchAuthorizeIframeµ ──────────────────────────────────────────────────

it.effect('dispatchAuthorizeIframeµ succeeds with iframe data', () =>
  Micro.gen(function* () {
    const iframeData = { code: 'iframe-code', state: 'state-abc' };
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      data: iframeData,
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const result = yield* dispatchAuthorizeIframeµ(
      mockStore,
      'https://example.com/authorize',
      wellknown,
      { clientId, redirectUri, scope, responseType },
    );
    expect(result).toStrictEqual(iframeData);
  }),
);

it.effect('dispatchAuthorizeIframeµ fails with unknown_error when data is undefined', () =>
  Micro.gen(function* () {
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      data: undefined,
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const exit = yield* Micro.exit(
      dispatchAuthorizeIframeµ(mockStore, 'https://example.com/authorize', wellknown, {
        clientId,
        redirectUri,
        scope,
        responseType,
      }),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('unknown_error');
  }),
);

it.effect('dispatchAuthorizeIframeµ fails with unknown_error when data has no code or state', () =>
  Micro.gen(function* () {
    vi.mocked(mockStore.dispatch).mockResolvedValueOnce({
      data: { unexpected: 'shape' },
    } as unknown as ReturnType<typeof mockStore.dispatch>);

    const exit = yield* Micro.exit(
      dispatchAuthorizeIframeµ(
        mockStore,
        'https://example.com/authorize?foo=bar',
        wellknown,
        {} as GetAuthorizationUrlOptions,
      ),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) return;
    expect(exit.cause.error.type).toBe('unknown_error');
    expect(exit.cause.error.error).toBe('Unknown_Error');
  }),
);
