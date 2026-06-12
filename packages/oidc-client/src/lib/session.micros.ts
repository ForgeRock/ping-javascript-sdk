/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Micro } from 'effect';

import { createRandomString, createState } from '@forgerock/sdk-utilities';

import { oidcApi } from './oidc.api.js';

import { decodeJwt } from 'jose/jwt/decode';
import type { JWTPayload } from 'jose';

import type { CustomLogger } from '@forgerock/sdk-logger';
import type { GenericError, WellknownResponse } from '@forgerock/sdk-types';
import type { StorageClient } from '@forgerock/storage';
import type { OauthTokens, OidcConfig } from './config.types.js';
import type { ClientStore } from './client.types.js';
import type { SessionCheckOptions, SessionCheckSuccess } from './session.types.js';

// ─── Storage read ─────────────────────────────────────────────────────────────

export const readStoredIdTokenµ = (
  storageClient: StorageClient<OauthTokens>,
): Micro.Micro<string | null, GenericError, never> =>
  Micro.tryPromise({
    try: () => storageClient.get(),
    catch: (): GenericError => ({
      error: 'storage_error',
      message: 'Failed to read tokens from storage',
      type: 'argument_error',
    }),
  }).pipe(Micro.map((tokens) => (tokens && 'idToken' in tokens ? tokens.idToken : null)));

// ─── Dispatch ────────────────────────────────────────────────────────────────

export const dispatchSessionCheckµ = (
  store: ClientStore,
  url: string,
  responseType: 'id_token' | 'none',
): Micro.Micro<Record<string, string>, GenericError, never> =>
  Micro.tryPromise({
    try: () => store.dispatch(oidcApi.endpoints.sessionCheckIframe.initiate({ url, responseType })),
    catch: (err): GenericError => ({
      error: 'dispatch_error',
      message: err instanceof Error ? err.message : 'Failed to dispatch session check',
      type: 'network_error',
    }),
  }).pipe(
    Micro.flatMap((result) => {
      if ('error' in result && result.error) {
        const errData = result.error as {
          data?: { error?: string; message?: string; type?: string };
        };
        return Micro.fail<GenericError>({
          error: errData.data?.error ?? 'session_check_error',
          message: errData.data?.message ?? 'An error occurred during session check',
          type: (errData.data?.type as GenericError['type']) ?? 'network_error',
        });
      }
      const { params } = (result as { data: { params: Record<string, string> } }).data;
      return Micro.succeed(params);
    }),
  );

// ─── Response validation ──────────────────────────────────────────────────────

export const validateSessionCheckResponseµ = (
  iframeParams: Record<string, string>,
  state: string,
  nonce: string,
  subject?: string,
): Micro.Micro<JWTPayload, GenericError, never> => {
  return Micro.gen(function* () {
    if (iframeParams.state !== state) {
      return yield* Micro.fail<GenericError>({
        error: 'state_mismatch',
        message: 'State parameter in response does not match the expected value',
        type: 'auth_error',
      });
    }

    const idToken = iframeParams.id_token;
    if (!idToken) {
      return yield* Micro.fail<GenericError>({
        error: 'no_id_token',
        message: 'No id_token found in iframe response',
        type: 'auth_error',
      });
    }

    const claims = yield* Micro.try({
      try: () => decodeJwt(idToken),
      catch: (): GenericError => ({
        error: 'invalid_jwt',
        message: 'Failed to decode id_token JWT payload',
        type: 'auth_error',
      }),
    });

    if (claims.nonce !== nonce) {
      return yield* Micro.fail<GenericError>({
        error: 'nonce_mismatch',
        message: 'Nonce in id_token does not match the expected value',
        type: 'auth_error',
      });
    }

    if (subject !== undefined && claims.sub !== subject) {
      return yield* Micro.fail<GenericError>({
        error: 'subject_mismatch',
        message: 'Subject claim in id_token does not match the expected value',
        type: 'auth_error',
      });
    }

    return claims;
  });
};

// ─── Param builders ───────────────────────────────────────────────────────────

export const buildNoneUrl = (
  endpoint: string,
  config: OidcConfig,
  storedIdToken: string | null,
  options?: SessionCheckOptions,
): string => {
  const params = new URLSearchParams({
    prompt: 'none',
    response_type: 'none',
    client_id: config.clientId,
    redirect_uri: options?.redirectUri ?? config.redirectUri,
    scope: options?.scope ?? 'openid',
    ...(storedIdToken ? { id_token_hint: storedIdToken } : {}),
  });
  return `${endpoint}?${params.toString()}`;
};

export const buildIdTokenUrl = (
  endpoint: string,
  config: OidcConfig,
  storedIdToken: string | null,
  options?: SessionCheckOptions,
): { url: string; nonce: string; state: string } => {
  const nonce = createRandomString(32);
  const state = createState();
  const params = new URLSearchParams({
    prompt: 'none',
    response_type: 'id_token',
    client_id: config.clientId,
    redirect_uri: options?.redirectUri ?? config.redirectUri,
    scope: options?.scope ?? 'openid',
    nonce,
    state,
    ...(storedIdToken ? { id_token_hint: storedIdToken } : {}),
  });
  return { url: `${endpoint}?${params.toString()}`, nonce, state };
};

// ─── None mode ───────────────────────────────────────────────────────────────

export const sessionCheckNoneµ = (
  wellknown: WellknownResponse,
  config: OidcConfig,
  store: ClientStore,
  storageClient: StorageClient<OauthTokens>,
  log: CustomLogger,
  options?: SessionCheckOptions,
): Micro.Micro<SessionCheckSuccess, GenericError, never> => {
  const redirectUri = options?.redirectUri ?? config.redirectUri;
  // none mode resolves by recognising when the iframe lands on the redirect URI.
  // An empty redirect_uri means the iframe never matches and silently times out instead of failing fast.
  if (!redirectUri) {
    return Micro.fail<GenericError>({
      error: 'missing_redirect_uri',
      message: 'redirect_uri is required for session check',
      type: 'argument_error',
    });
  }

  return readStoredIdTokenµ(storageClient).pipe(
    Micro.flatMap((storedIdToken) => {
      const url = buildNoneUrl(wellknown.authorization_endpoint, config, storedIdToken, options);
      log.debug('Session check (none) URL built');
      return dispatchSessionCheckµ(store, url, 'none');
    }),
    Micro.tap(() => Micro.sync(() => log.debug('Session check (none) completed successfully'))),
    Micro.map((): SessionCheckSuccess => ({ mode: 'none' })),
  );
};

// ─── IdToken mode ─────────────────────────────────────────────────────────────

export const sessionCheckIdTokenµ = (
  wellknown: WellknownResponse,
  config: OidcConfig,
  store: ClientStore,
  storageClient: StorageClient<OauthTokens>,
  log: CustomLogger,
  options?: SessionCheckOptions,
): Micro.Micro<SessionCheckSuccess, GenericError, never> => {
  return readStoredIdTokenµ(storageClient).pipe(
    Micro.flatMap((storedIdToken) => {
      const { url, nonce, state } = buildIdTokenUrl(
        wellknown.authorization_endpoint,
        config,
        storedIdToken,
        options,
      );
      log.debug('Session check (id_token) URL built');
      return dispatchSessionCheckµ(store, url, 'id_token').pipe(
        Micro.flatMap((iframeParams) =>
          validateSessionCheckResponseµ(iframeParams, state, nonce, options?.subject),
        ),
      );
    }),
    Micro.tap(() => Micro.sync(() => log.debug('Session check (id_token) completed successfully'))),
    Micro.map((claims): SessionCheckSuccess => ({ mode: 'id_token', claims })),
  );
};
