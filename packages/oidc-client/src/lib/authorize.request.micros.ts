/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import {
  buildAuthorizeParams,
  createAuthorizeUrl,
  generateAndStoreAuthUrlValues,
} from '@forgerock/sdk-oidc';
import { createChallenge } from '@forgerock/sdk-utilities';
import { Micro } from 'effect';

import {
  buildParAuthorizeUrl,
  hasPushRequestUri,
  isFetchBaseQueryError,
  toDispatchError,
} from './authorize.request.utils.js';
import type { AuthPromptValue } from '@forgerock/sdk-utilities';

import { oidcApi } from './oidc.api.js';

import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { GetAuthorizationUrlOptions, WellknownResponse } from '@forgerock/sdk-types';
import type {
  AuthorizationError,
  AuthorizationSuccess,
  OptionalAuthorizeOptions,
} from './authorize.request.types.js';
import type { ClientStore } from './client.types.js';
import type { OidcConfig } from './config.types.js';

// ─── Crypto / sessionStorage side effects ────────────────────────────────────

export const generateAuthValuesµ = (
  config: OidcConfig,
  wellknown: WellknownResponse,
  options?: OptionalAuthorizeOptions,
): Micro.Micro<ReturnType<typeof generateAndStoreAuthUrlValues>, AuthorizationError, never> => {
  return Micro.try({
    try: () =>
      generateAndStoreAuthUrlValues({
        clientId: config.clientId,
        serverConfig: { baseUrl: new URL(wellknown.authorization_endpoint).origin },
        responseType: config.responseType || 'code',
        redirectUri: config.redirectUri,
        scope: config.scope || 'openid',
        ...options,
      }),
    catch: (err): AuthorizationError => ({
      error: 'PAR_PARAM_BUILD_ERROR',
      error_description: err instanceof Error ? err.message : 'Failed to generate auth URL values',
      type: 'auth_error',
    }),
  });
};

export const generatePkceChallengeµ = (
  verifier: string,
): Micro.Micro<string, AuthorizationError, never> => {
  return Micro.tryPromise({
    try: () => createChallenge(verifier),
    catch: (err): AuthorizationError => ({
      error: 'PAR_CHALLENGE_ERROR',
      error_description: err instanceof Error ? err.message : 'Failed to generate PKCE challenge',
      type: 'auth_error',
    }),
  });
};

export const storeAuthOptionsµ = (
  storeOptions: () => void,
): Micro.Micro<void, AuthorizationError, never> => {
  return Micro.try({
    try: () => storeOptions(),
    catch: (err): AuthorizationError => ({
      error: 'PAR_STORAGE_ERROR',
      error_description: err instanceof Error ? err.message : 'Failed to store PAR session options',
      type: 'unknown_error',
    }),
  });
};

// ─── PAR body / URL builders ─────────────────────────────────────────────────

export const buildParBodyµ = (
  config: OidcConfig,
  parBodyOptions: OptionalAuthorizeOptions,
  challenge: string,
  state: string,
  prompt?: AuthPromptValue,
): Micro.Micro<URLSearchParams, AuthorizationError, never> => {
  return Micro.try({
    try: () =>
      buildAuthorizeParams({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        scope: config.scope || 'openid',
        responseType: config.responseType || 'code',
        ...parBodyOptions,
        challenge,
        state,
        ...(prompt && { prompt }),
      }),
    catch: (err): AuthorizationError => ({
      error: 'PAR_PARAM_BUILD_ERROR',
      error_description: err instanceof Error ? err.message : 'Failed to build PAR parameters',
      type: 'auth_error',
    }),
  });
};

export const createAuthorizeUrlµ = (
  path: string,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<[string, GetAuthorizationUrlOptions], AuthorizationError, never> => {
  return Micro.tryPromise({
    try: async () =>
      [await createAuthorizeUrl(path, { ...options, prompt: 'none' }), options] as [
        string,
        GetAuthorizationUrlOptions,
      ],
    catch: (error): AuthorizationError => ({
      error: 'AuthorizationUrlError',
      error_description:
        error instanceof Error ? error.message : 'Error creating authorization URL',
      type: 'auth_error',
    }),
  });
};

export const buildAuthorizeRedirectUrlµ = (
  res: { error: string; error_description: string },
  wellknown: WellknownResponse,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<never, AuthorizationError, never> => {
  return Micro.tryPromise({
    try: () => createAuthorizeUrl(wellknown.authorization_endpoint, { ...options }),
    catch: (error): AuthorizationError => ({
      error: 'AuthorizationUrlError',
      error_description:
        error instanceof Error ? error.message : 'Error creating authorization URL',
      type: 'auth_error',
    }),
  }).pipe(
    Micro.flatMap((url) =>
      Micro.fail({
        error: res.error,
        error_description: res.error_description,
        type: 'auth_error',
        redirectUrl: url,
      } as const),
    ),
  );
};

export const validateParResponseµ = (result: {
  error?: FetchBaseQueryError | SerializedError;
  data?: unknown;
}): Micro.Micro<{ request_uri: string; expires_in: number }, AuthorizationError, never> => {
  if (result.error) {
    return Micro.fail(toDispatchError(result.error));
  }
  if (!hasPushRequestUri(result.data)) {
    return Micro.fail({
      error: 'PAR_ERROR',
      error_description: "PAR response missing required 'request_uri' field",
      type: 'network_error',
    } as const);
  }
  const d = result.data as { request_uri: string; expires_in?: number };
  return Micro.succeed({ request_uri: d.request_uri, expires_in: d.expires_in ?? 60 });
};

export const handleDispatchErrorµ = (
  error: FetchBaseQueryError | SerializedError,
  wellknown: WellknownResponse,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<never, AuthorizationError, never> => {
  const errorDetails = toDispatchError(error);
  const isConfigError =
    isFetchBaseQueryError(error) &&
    'statusText' in error &&
    error.statusText === 'CONFIGURATION_ERROR';

  return isConfigError
    ? Micro.fail(errorDetails)
    : buildAuthorizeRedirectUrlµ(errorDetails, wellknown, options);
};

// ─── PAR POST ────────────────────────────────────────────────────────────────

export const dispatchParRequestµ = (
  store: ClientStore,
  parEndpoint: string,
  body: URLSearchParams,
): Micro.Micro<
  { error?: FetchBaseQueryError | SerializedError; data?: unknown },
  AuthorizationError,
  never
> => {
  return Micro.tryPromise({
    try: () => store.dispatch(oidcApi.endpoints.par.initiate({ endpoint: parEndpoint, body })),
    catch: (error): AuthorizationError => ({
      error: 'PAR_DISPATCH_ERROR',
      error_description: error instanceof Error ? error.message : 'Failed to dispatch PAR request',
      type: 'network_error',
    }),
  });
};

export const buildParSlimUrlµ = (
  authorizationEndpoint: string,
  clientId: string,
  requestUri: string,
  prompt?: AuthPromptValue,
): Micro.Micro<string, AuthorizationError, never> => {
  return Micro.try({
    try: () => buildParAuthorizeUrl({ authorizationEndpoint, clientId, requestUri, prompt }),
    catch: (err): AuthorizationError => ({
      error: 'PAR_URL_BUILD_ERROR',
      error_description: err instanceof Error ? err.message : 'Failed to build PAR authorize URL',
      type: 'unknown_error',
    }),
  });
};

// ─── Authorize dispatch ───────────────────────────────────────────────────────

export const dispatchAuthorizeFetchµ = (
  store: ClientStore,
  url: string,
  wellknown: WellknownResponse,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> => {
  return Micro.tryPromise({
    try: () => store.dispatch(oidcApi.endpoints.authorizeFetch.initiate({ url })),
    catch: (error): AuthorizationError => ({
      error: 'AUTHORIZE_DISPATCH_ERROR',
      error_description:
        error instanceof Error ? error.message : 'Failed to dispatch authorize request',
      type: 'network_error',
    }),
  }).pipe(
    Micro.flatMap(({ error, data }) => {
      if (error) {
        return handleDispatchErrorµ(error, wellknown, options);
      }
      if (data?.authorizeResponse) {
        return Micro.succeed(data.authorizeResponse);
      }
      return Micro.fail({
        error: 'Unknown_Error',
        error_description: 'Response schema was not recognized',
        type: 'unknown_error',
      } as const);
    }),
  );
};

export const dispatchAuthorizeIframeµ = (
  store: ClientStore,
  url: string,
  wellknown: WellknownResponse,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> => {
  return Micro.tryPromise({
    try: () => store.dispatch(oidcApi.endpoints.authorizeIframe.initiate({ url })),
    catch: (error): AuthorizationError => ({
      error: 'AUTHORIZE_DISPATCH_ERROR',
      error_description:
        error instanceof Error ? error.message : 'Failed to dispatch authorize request',
      type: 'network_error',
    }),
  }).pipe(
    Micro.flatMap(({ error, data }) => {
      if (error) {
        return handleDispatchErrorµ(error, wellknown, options);
      }
      const d = data as { code?: unknown; state?: unknown } | undefined;
      if (d !== undefined && typeof d.code === 'string' && typeof d.state === 'string') {
        return Micro.succeed(d as AuthorizationSuccess);
      }
      return Micro.fail({
        error: 'Unknown_Error',
        error_description: 'Response data did not contain expected code and state fields',
        type: 'unknown_error',
      } as const);
    }),
  );
};
