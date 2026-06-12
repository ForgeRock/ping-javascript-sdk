/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { it, expect } from '@effect/vitest';
import { Micro } from 'effect';
import { vi, afterEach, describe } from 'vitest';
import * as sdkUtilities from '@forgerock/sdk-utilities';

import {
  buildNoneUrl,
  buildIdTokenUrl,
  dispatchSessionCheckµ,
  readStoredIdTokenµ,
  sessionCheckIdTokenµ,
  sessionCheckNoneµ,
  validateSessionCheckResponseµ,
} from './session.micros.js';
import { oidcApi } from './oidc.api.js';

import { logger as loggerFn } from '@forgerock/sdk-logger';
import type { OidcConfig } from './config.types.js';
import type { WellknownResponse } from '@forgerock/sdk-types';
import type { ClientStore } from './client.types.js';
import type { StorageClient } from '@forgerock/storage';
import type { OauthTokens } from './config.types.js';
import type { GenericError } from '@forgerock/sdk-types';
import type { JWTPayload } from 'jose';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const clientId = 'test-client-id';
const redirectUri = 'https://example.com/callback.html';
const endpoint = 'https://example.com/authorize';

const config: OidcConfig = {
  clientId,
  redirectUri,
  scope: 'openid profile',
  responseType: 'code',
  serverConfig: {
    wellknown: 'https://example.com/.well-known/openid-configuration',
  },
};

const wellknown: WellknownResponse = {
  issuer: 'https://example.com',
  authorization_endpoint: endpoint,
  token_endpoint: 'https://example.com/token',
  userinfo_endpoint: 'https://example.com/userinfo',
  end_session_endpoint: 'https://example.com/logout',
  introspection_endpoint: 'https://example.com/introspect',
  revocation_endpoint: 'https://example.com/revoke',
};

const storedTokens: OauthTokens = {
  accessToken: 'access-token-abc',
  idToken: 'stored-id-token-xyz',
  expiresAt: Date.now() + 60000,
};

function makeStorageClient(token: OauthTokens | null): StorageClient<OauthTokens> {
  return {
    get: vi.fn().mockResolvedValue(token),
    set: vi.fn().mockResolvedValue(null),
    remove: vi.fn().mockResolvedValue(null),
  };
}

const log = loggerFn({ level: 'error' });

afterEach(() => {
  vi.restoreAllMocks();
});

function makeDispatchSetup(dispatchResult: unknown) {
  const capturedArgs: Array<{ url: string; responseType: string }> = [];
  const sentinel = Symbol('dispatch-sentinel');
  vi.spyOn(oidcApi.endpoints.sessionCheckIframe, 'initiate').mockImplementation((arg) => {
    capturedArgs.push(arg as { url: string; responseType: string });
    return sentinel as unknown as ReturnType<typeof oidcApi.endpoints.sessionCheckIframe.initiate>;
  });

  const dispatch = vi.fn().mockResolvedValue(dispatchResult);
  const store: ClientStore = { dispatch } as unknown as ClientStore;

  return { capturedArgs, store, dispatch };
}

// ─── buildNoneUrl ─────────────────────────────────────────────────────────────

describe('buildNoneUrl', () => {
  it('builds URL with expected params and no state', () => {
    const url = buildNoneUrl(endpoint, config, storedTokens.idToken);
    const parsed = new URL(url);

    expect(parsed.searchParams.get('prompt')).toBe('none');
    expect(parsed.searchParams.get('response_type')).toBe('none');
    expect(parsed.searchParams.get('client_id')).toBe(clientId);
    expect(parsed.searchParams.get('redirect_uri')).toBe(redirectUri);
    expect(parsed.searchParams.get('id_token_hint')).toBe(storedTokens.idToken);
    expect(parsed.searchParams.has('state')).toBe(false);
    expect(parsed.searchParams.has('nonce')).toBe(false);
  });

  it('uses options.redirectUri when provided', () => {
    const url = buildNoneUrl(endpoint, config, storedTokens.idToken, {
      redirectUri: 'https://example.com/custom.html',
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://example.com/custom.html');
  });
});

// ─── buildIdTokenUrl ──────────────────────────────────────────────────────────

describe('buildIdTokenUrl', () => {
  it('builds URL with nonce, state, scope, and response_type=id_token', () => {
    const knownNonce = 'test-nonce';
    const knownState = 'test-state';
    vi.spyOn(sdkUtilities, 'createRandomString').mockReturnValue(knownNonce);
    vi.spyOn(sdkUtilities, 'createState').mockReturnValue(knownState);

    const { url, nonce, state } = buildIdTokenUrl(endpoint, config, null);
    const parsed = new URL(url);

    expect(parsed.searchParams.get('response_type')).toBe('id_token');
    expect(parsed.searchParams.get('nonce')).toBe(knownNonce);
    expect(parsed.searchParams.get('state')).toBe(knownState);
    expect(parsed.searchParams.get('scope')).toBe('openid');
    expect(parsed.searchParams.has('id_token_hint')).toBe(false);
    expect(nonce).toBe(knownNonce);
    expect(state).toBe(knownState);
  });

  it('includes id_token_hint when storedIdToken is present', () => {
    const { url } = buildIdTokenUrl(endpoint, config, storedTokens.idToken);
    const parsed = new URL(url);
    expect(parsed.searchParams.get('id_token_hint')).toBe(storedTokens.idToken);
  });

  it('omits id_token_hint when storedIdToken is null', () => {
    const { url } = buildIdTokenUrl(endpoint, config, null);
    const parsed = new URL(url);
    expect(parsed.searchParams.has('id_token_hint')).toBe(false);
  });

  it('uses options.scope when provided', () => {
    const { url } = buildIdTokenUrl(endpoint, config, null, { scope: 'openid profile' });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('scope')).toBe('openid profile');
  });
});

// ─── sessionCheckNoneµ ────────────────────────────────────────────────────────

it.effect(
  'sessionCheckNoneµ fails with missing_redirect_uri when no redirect URI is configured',
  () =>
    Micro.gen(function* () {
      const dispatch = vi.fn();
      const store: ClientStore = { dispatch } as unknown as ClientStore;
      const configWithoutRedirectUri: OidcConfig = { ...config, redirectUri: '' };

      const exit = yield* Micro.exit(
        sessionCheckNoneµ(wellknown, configWithoutRedirectUri, store, makeStorageClient(null), log),
      );

      expect(Micro.exitIsFailure(exit)).toBe(true);
      if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
        return;
      }
      expect(exit.cause.error.error).toBe('missing_redirect_uri');
      expect(exit.cause.error.type).toBe('argument_error');
      expect(dispatch).not.toHaveBeenCalled();
    }),
);

it.effect('sessionCheckNoneµ dispatches and succeeds when token is stored', () =>
  Micro.gen(function* () {
    const { store, dispatch } = makeDispatchSetup({ data: { params: {} } });

    const exit = yield* Micro.exit(
      sessionCheckNoneµ(wellknown, config, store, makeStorageClient(storedTokens), log),
    );

    expect(Micro.exitIsSuccess(exit)).toBe(true);
    expect(dispatch).toHaveBeenCalledOnce();
  }),
);

it.effect('sessionCheckNoneµ dispatches and succeeds when storage is empty (best-effort)', () =>
  Micro.gen(function* () {
    const { store, dispatch } = makeDispatchSetup({ data: { params: {} } });

    const exit = yield* Micro.exit(
      sessionCheckNoneµ(wellknown, config, store, makeStorageClient(null), log),
    );

    expect(Micro.exitIsSuccess(exit)).toBe(true);
    expect(dispatch).toHaveBeenCalledOnce();
  }),
);

// ─── sessionCheckIdTokenµ ─────────────────────────────────────────────────────

it.effect('sessionCheckIdTokenµ returns claims on valid JWT', () =>
  Micro.gen(function* () {
    const knownNonce = 'test-nonce-value-12345678901234';
    const knownState = 'known-state-value';
    vi.spyOn(sdkUtilities, 'createRandomString').mockReturnValue(knownNonce);
    vi.spyOn(sdkUtilities, 'createState').mockReturnValue(knownState);

    const payload = { nonce: knownNonce, sub: 'user1', iat: 1000 };
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const validJwt = `header.${encodedPayload}.sig`;

    const { store } = makeDispatchSetup({
      data: { params: { id_token: validJwt, state: knownState } },
    });

    const exit = yield* Micro.exit(
      sessionCheckIdTokenµ(wellknown, config, store, makeStorageClient(storedTokens), log),
    );

    expect(Micro.exitIsSuccess(exit)).toBe(true);
    if (!Micro.exitIsSuccess(exit)) {
      return;
    }
    expect(exit.value.mode).toBe('id_token');
    if (exit.value.mode !== 'id_token') {
      return;
    }
    expect(exit.value.claims['nonce']).toBe(knownNonce);
  }),
);

it.effect('sessionCheckIdTokenµ fails with state_mismatch when response state does not match', () =>
  Micro.gen(function* () {
    vi.spyOn(sdkUtilities, 'createState').mockReturnValue('known-state-value');

    const { store } = makeDispatchSetup({
      data: { params: { id_token: 'some.jwt.token', state: 'tampered-state' } },
    });

    const exit = yield* Micro.exit(
      sessionCheckIdTokenµ(wellknown, config, store, makeStorageClient(storedTokens), log),
    );

    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('state_mismatch');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);

it.effect('sessionCheckIdTokenµ fails with no_id_token when iframe returns no id_token param', () =>
  Micro.gen(function* () {
    const knownState = 'known-state-value';
    vi.spyOn(sdkUtilities, 'createState').mockReturnValue(knownState);

    const { store } = makeDispatchSetup({ data: { params: { state: knownState } } });

    const exit = yield* Micro.exit(
      sessionCheckIdTokenµ(wellknown, config, store, makeStorageClient(storedTokens), log),
    );

    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('no_id_token');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);

// ─── readStoredIdTokenµ ───────────────────────────────────────────────────────

it.effect('readStoredIdTokenµ returns idToken string when tokens are stored', () =>
  Micro.gen(function* () {
    const result = yield* readStoredIdTokenµ(makeStorageClient(storedTokens));
    expect(result).toBe(storedTokens.idToken);
  }),
);

it.effect('readStoredIdTokenµ returns null when storage is empty', () =>
  Micro.gen(function* () {
    const result = yield* readStoredIdTokenµ(makeStorageClient(null));
    expect(result).toBeNull();
  }),
);

it.effect('readStoredIdTokenµ fails with argument_error when storageClient.get rejects', () =>
  Micro.gen(function* () {
    const failingStorage: StorageClient<OauthTokens> = {
      get: vi.fn().mockRejectedValue(new Error('storage unavailable')),
      set: vi.fn(),
      remove: vi.fn(),
    };
    const exit = yield* Micro.exit(readStoredIdTokenµ(failingStorage));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.type).toBe('argument_error');
    expect(exit.cause.error.error).toBe('storage_error');
  }),
);

// ─── dispatchSessionCheckµ ────────────────────────────────────────────────────

it.effect(
  'dispatchSessionCheckµ succeeds and returns params when dispatch resolves with data',
  () =>
    Micro.gen(function* () {
      const params = { state: 'ok' };
      const dispatch = vi.fn().mockResolvedValue({ data: { params } });
      const store: ClientStore = { dispatch } as unknown as ClientStore;
      vi.spyOn(oidcApi.endpoints.sessionCheckIframe, 'initiate').mockReturnValue(
        Symbol('sentinel') as unknown as ReturnType<
          typeof oidcApi.endpoints.sessionCheckIframe.initiate
        >,
      );

      const result = yield* dispatchSessionCheckµ(
        store,
        'https://example.com/authorize?prompt=none',
        'none',
      );
      expect(result).toStrictEqual(params);
    }),
);

it.effect(
  'dispatchSessionCheckµ fails with auth_error when dispatch resolves with an error result',
  () =>
    Micro.gen(function* () {
      const errorData: GenericError = {
        error: 'login_required',
        message: 'User must authenticate',
        type: 'auth_error',
      };
      const dispatch = vi.fn().mockResolvedValue({ error: { data: errorData } });
      const store: ClientStore = { dispatch } as unknown as ClientStore;
      vi.spyOn(oidcApi.endpoints.sessionCheckIframe, 'initiate').mockReturnValue(
        Symbol('sentinel') as unknown as ReturnType<
          typeof oidcApi.endpoints.sessionCheckIframe.initiate
        >,
      );

      const exit = yield* Micro.exit(
        dispatchSessionCheckµ(store, 'https://example.com/authorize?prompt=none', 'none'),
      );
      expect(Micro.exitIsFailure(exit)).toBe(true);
      if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
        return;
      }
      expect(exit.cause.error.error).toBe('login_required');
      expect(exit.cause.error.type).toBe('auth_error');
    }),
);

it.effect('dispatchSessionCheckµ fails with network_error when dispatch rejects', () =>
  Micro.gen(function* () {
    const dispatch = vi.fn().mockRejectedValue(new Error('network failure'));
    const store: ClientStore = { dispatch } as unknown as ClientStore;
    vi.spyOn(oidcApi.endpoints.sessionCheckIframe, 'initiate').mockReturnValue(
      Symbol('sentinel') as unknown as ReturnType<
        typeof oidcApi.endpoints.sessionCheckIframe.initiate
      >,
    );

    const exit = yield* Micro.exit(
      dispatchSessionCheckµ(store, 'https://example.com/authorize?prompt=none', 'none'),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.type).toBe('network_error');
    expect(exit.cause.error.error).toBe('dispatch_error');
  }),
);

// ─── validateSessionCheckResponseµ ───────────────────────────────────────────

function makeJwtWithClaims(claims: JWTPayload): string {
  const payload = btoa(JSON.stringify(claims))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `header.${payload}.sig`;
}

it.effect(
  'validateSessionCheckResponseµ succeeds and returns claims when state and nonce match',
  () =>
    Micro.gen(function* () {
      const nonce = 'expected-nonce';
      const state = 'expected-state';
      const jwt = makeJwtWithClaims({ nonce, sub: 'user1' });
      const result = yield* validateSessionCheckResponseµ({ id_token: jwt, state }, state, nonce);
      expect(result).toMatchObject({ nonce, sub: 'user1' });
    }),
);

it.effect('validateSessionCheckResponseµ succeeds when state, nonce, and subject all match', () =>
  Micro.gen(function* () {
    const nonce = 'nonce-abc';
    const state = 'state-abc';
    const jwt = makeJwtWithClaims({ nonce, sub: 'user1' });
    const result = yield* validateSessionCheckResponseµ(
      { id_token: jwt, state },
      state,
      nonce,
      'user1',
    );
    expect(result).toMatchObject({ nonce, sub: 'user1' });
  }),
);

it.effect('validateSessionCheckResponseµ fails with state_mismatch when state does not match', () =>
  Micro.gen(function* () {
    const jwt = makeJwtWithClaims({ nonce: 'nonce', sub: 'user1' });
    const exit = yield* Micro.exit(
      validateSessionCheckResponseµ(
        { id_token: jwt, state: 'tampered' },
        'expected-state',
        'nonce',
      ),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('state_mismatch');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);

it.effect('validateSessionCheckResponseµ fails with no_id_token when id_token is absent', () =>
  Micro.gen(function* () {
    const state = 'expected-state';
    const exit = yield* Micro.exit(validateSessionCheckResponseµ({ state }, state, 'nonce'));
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('no_id_token');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);

it.effect('validateSessionCheckResponseµ fails with nonce_mismatch when nonce does not match', () =>
  Micro.gen(function* () {
    const state = 'expected-state';
    const jwt = makeJwtWithClaims({ nonce: 'wrong-nonce', sub: 'user1' });
    const exit = yield* Micro.exit(
      validateSessionCheckResponseµ({ id_token: jwt, state }, state, 'expected-nonce'),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('nonce_mismatch');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);

it.effect('validateSessionCheckResponseµ fails with subject_mismatch when sub does not match', () =>
  Micro.gen(function* () {
    const nonce = 'valid-nonce';
    const state = 'expected-state';
    const jwt = makeJwtWithClaims({ nonce, sub: 'user2' });
    const exit = yield* Micro.exit(
      validateSessionCheckResponseµ({ id_token: jwt, state }, state, nonce, 'user1'),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('subject_mismatch');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);

it.effect('validateSessionCheckResponseµ fails with invalid_jwt when JWT is malformed', () =>
  Micro.gen(function* () {
    const state = 'expected-state';
    const exit = yield* Micro.exit(
      validateSessionCheckResponseµ({ id_token: 'not.a.valid.jwt.payload', state }, state, 'nonce'),
    );
    expect(Micro.exitIsFailure(exit)).toBe(true);
    if (!Micro.exitIsFailure(exit) || !Micro.causeIsFail(exit.cause)) {
      return;
    }
    expect(exit.cause.error.error).toBe('invalid_jwt');
    expect(exit.cause.error.type).toBe('auth_error');
  }),
);
