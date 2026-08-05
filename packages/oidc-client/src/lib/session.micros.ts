/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';

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
): Effect.Effect<string | null, GenericError, never> =>
  Effect.tryPromise({
    try: () => storageClient.get(),
    catch: (): GenericError => ({
      error: 'storage_error',
      message: 'Failed to read tokens from storage',
      type: 'argument_error',
    }),
  }).pipe(Effect.map((tokens) => (tokens && 'idToken' in tokens ? tokens.idToken : null)));

// ─── Dispatch ────────────────────────────────────────────────────────────────

export const dispatchSessionCheckIframeµ = (
  store: ClientStore,
  url: string,
  responseType: 'id_token' | 'none',
): Effect.Effect<Record<string, string>, GenericError, never> =>
  Effect.tryPromise({
    try: () => store.dispatch(oidcApi.endpoints.sessionCheckIframe.initiate({ url, responseType })),
    catch: (err): GenericError => ({
      error: 'dispatch_error',
      message: err instanceof Error ? err.message : 'Failed to dispatch session check',
      type: 'network_error',
    }),
  }).pipe(
    Effect.flatMap((result) => {
      if ('error' in result && result.error) {
        const errData = result.error as {
          data?: { error?: string; message?: string; type?: string };
        };
        return Effect.fail<GenericError>({
          error: errData.data?.error ?? 'session_check_error',
          message: errData.data?.message ?? 'An error occurred during session check',
          type: (errData.data?.type as GenericError['type']) ?? 'network_error',
        });
      }
      const { params } = (result as { data: { params: Record<string, string> } }).data;
      return Effect.succeed(params);
    }),
  );

export const dispatchSessionCheckFetchµ = (
  store: ClientStore,
  url: string,
): Effect.Effect<void, GenericError, never> =>
  Effect.tryPromise({
    try: () => store.dispatch(oidcApi.endpoints.sessionCheckFetch.initiate({ url })),
    catch: (err): GenericError => ({
      error: 'dispatch_error',
      message: err instanceof Error ? err.message : 'Failed to dispatch session check',
      type: 'network_error',
    }),
  }).pipe(
    Effect.flatMap((result) => {
      if ('error' in result && result.error) {
        const errData = result.error as {
          data?: { error?: string; message?: string; type?: string };
        };
        return Effect.fail<GenericError>({
          error: errData.data?.error ?? 'login_required',
          message: errData.data?.message ?? 'The request requires login.',
          type: (errData.data?.type as GenericError['type']) ?? 'auth_error',
        });
      }
      return Effect.void;
    }),
  );

// ─── Response validation ──────────────────────────────────────────────────────

export const validateSessionCheckResponseµ = (
  iframeParams: Record<string, string>,
  state: string,
  nonce: string,
  subject?: string,
): Effect.Effect<JWTPayload, GenericError, never> => {
  return Effect.gen(function* () {
    if (iframeParams.state !== state) {
      return yield* Effect.fail<GenericError>({
        error: 'state_mismatch',
        message: 'State parameter in response does not match the expected value',
        type: 'auth_error',
      });
    }

    const idToken = iframeParams.id_token;
    if (!idToken) {
      return yield* Effect.fail<GenericError>({
        error: 'no_id_token',
        message: 'No id_token found in iframe response',
        type: 'auth_error',
      });
    }

    const claims = yield* Effect.try({
      try: () => decodeJwt(idToken),
      catch: (): GenericError => ({
        error: 'invalid_jwt',
        message: 'Failed to decode id_token JWT payload',
        type: 'auth_error',
      }),
    });

    if (claims.nonce !== nonce) {
      return yield* Effect.fail<GenericError>({
        error: 'nonce_mismatch',
        message: 'Nonce in id_token does not match the expected value',
        type: 'auth_error',
      });
    }

    if (subject !== undefined && claims.sub !== subject) {
      return yield* Effect.fail<GenericError>({
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
  storedIdToken: string,
  redirectUri: string,
  options?: SessionCheckOptions,
): string => {
  const params = new URLSearchParams({
    prompt: 'none',
    response_type: 'none',
    client_id: config.clientId,
    scope: options?.scope ?? 'openid',
    ...(redirectUri ? { redirect_uri: redirectUri } : {}),
    id_token_hint: storedIdToken,
  });
  return `${endpoint}?${params.toString()}`;
};

export const buildIdTokenUrl = (
  endpoint: string,
  config: OidcConfig,
  storedIdToken: string | null,
  redirectUri: string,
  options?: SessionCheckOptions,
): { url: string; nonce: string; state: string } => {
  const nonce = createRandomString(32);
  const state = createState();
  const params = new URLSearchParams({
    prompt: 'none',
    response_type: 'id_token',
    client_id: config.clientId,
    redirect_uri: redirectUri,
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
): Effect.Effect<SessionCheckSuccess, GenericError, never> => {
  return readStoredIdTokenµ(storageClient).pipe(
    Effect.flatMap((storedIdToken) => {
      if (!storedIdToken) {
        return Effect.fail<GenericError>({
          error: 'no_id_token_hint',
          message: 'response_type=none requires a stored id_token; authenticate first',
          type: 'argument_error',
        });
      }

      const redirectUri = options?.redirectUri ?? config.redirectUri;
      const url = buildNoneUrl(
        wellknown.authorization_endpoint,
        config,
        storedIdToken,
        redirectUri,
        options,
      );

      // iframe path: AM redirects back to redirect_uri; resolve on landing
      // fetch path: no redirect_uri, AM returns 204 (valid) or 400 (invalid)
      return redirectUri
        ? dispatchSessionCheckIframeµ(store, url, 'none')
        : dispatchSessionCheckFetchµ(store, url);
    }),
    Effect.tap(() => Effect.sync(() => log.debug('Session check (none) completed successfully'))),
    Effect.map((): SessionCheckSuccess => ({ responseType: 'none' })),
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
): Effect.Effect<SessionCheckSuccess, GenericError, never> => {
  const redirectUri = options?.redirectUri ?? config.redirectUri;

  if (!redirectUri) {
    return Effect.fail<GenericError>({
      error: 'missing_redirect_uri',
      message: 'redirect_uri is required for session check with response_type=id_token',
      type: 'argument_error',
    });
  }

  return readStoredIdTokenµ(storageClient).pipe(
    Effect.flatMap((storedIdToken) => {
      const { url, nonce, state } = buildIdTokenUrl(
        wellknown.authorization_endpoint,
        config,
        storedIdToken,
        redirectUri,
        options,
      );
      return dispatchSessionCheckIframeµ(store, url, 'id_token').pipe(
        Effect.flatMap((iframeParams) =>
          validateSessionCheckResponseµ(iframeParams, state, nonce, options?.subject),
        ),
      );
    }),
    Effect.tap(() =>
      Effect.sync(() => log.debug('Session check (id_token) completed successfully')),
    ),
    Effect.map((claims): SessionCheckSuccess => ({ responseType: 'id_token', claims })),
  );
};
