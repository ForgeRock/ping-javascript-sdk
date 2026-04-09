/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createAuthorizeUrl, type AuthorizeUrlResult } from '@forgerock/sdk-oidc';
import { Micro } from 'effect';

import type { WellknownResponse, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { AuthPromptValue } from '@forgerock/sdk-utilities';
import type {
  AuthorizationError,
  AuthorizationSuccess,
  OptionalAuthorizeOptions,
} from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

export type ParUrlParams = {
  authorizationEndpoint: string;
  clientId: string;
  requestUri: string;
  prompt?: AuthPromptValue;
};

export function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasPushRequestUri(data: unknown): data is { request_uri: string } {
  return isStringRecord(data) && typeof data['request_uri'] === 'string';
}

export function buildAuthorizeOptions(
  wellknown: WellknownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): [string, GetAuthorizationUrlOptions] {
  const isPiFlow = wellknown.response_modes_supported?.includes('pi.flow');
  return [
    wellknown.authorization_endpoint,
    {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scope: config.scope || 'openid',
      responseType: config.responseType || 'code',
      ...(isPiFlow && { responseMode: 'pi.flow' as const }),
      ...options,
    },
  ];
}

/**
 * @function createAuthorizeErrorµ
 * @description Creates an error response with new Authorize URL for the authorization request.
 * @param { error: string; error_description: string } res - The error response from the authorization request.
 * @param {WellknownResponse} wellknown- The well-known configuration for the OIDC server.
 * @param { GetAuthorizationUrlOptions } options- Optional parameters for the authorization request.
 * @returns { Micro.Micro<never, AuthorizationError, never> }
 */
export function createAuthorizeErrorµ(
  res: { error: string; error_description: string },
  wellknown: WellknownResponse,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<never, AuthorizationError, never> {
  return Micro.tryPromise({
    try: () =>
      createAuthorizeUrl(wellknown.authorization_endpoint, {
        ...options,
      }),
    catch: (error) => {
      let message = 'Error creating authorization URL';
      if (error instanceof Error) {
        message = error.message;
      }
      return {
        error: 'AuthorizationUrlError',
        error_description: message,
        type: 'auth_error',
      } as const;
    },
  }).pipe(
    Micro.flatMap((result) => {
      return Micro.fail({
        error: res.error,
        error_description: res.error_description,
        type: 'auth_error',
        redirectUrl: result.url,
      } as const);
    }),
  );
}

/**
 * @function createAuthorizeUrlµ
 * @description Creates an authorization URL and related options/config for the Authorize request.
 *              Stores PKCE values in sessionStorage for the background authorize flow.
 * @param {string} path - The path to the authorization endpoint.
 * @param { GetAuthorizationUrlOptions } options - Optional parameters for the authorization request.
 * @returns { Micro.Micro<[string, GetAuthorizationUrlOptions], AuthorizationError, never> }
 */
export function createAuthorizeUrlµ(
  path: string,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<[string, GetAuthorizationUrlOptions], AuthorizationError, never> {
  return Micro.tryPromise({
    try: async (): Promise<[string, GetAuthorizationUrlOptions]> => {
      const result = await createAuthorizeUrl(path, {
        ...options,
        prompt: 'none',
      });

      // For the background flow, persist PKCE values in sessionStorage
      // so the token exchange can retrieve them after the iframe redirect.
      storePkceValues(options.clientId, result, options);

      return [result.url, options];
    },
    catch: (error) => {
      let message = 'Error creating authorization URL';
      if (error instanceof Error) {
        message = error.message;
      }
      return {
        error: 'AuthorizationUrlError',
        error_description: message,
        type: 'auth_error',
      } as const;
    },
  });
}

/**
 * Store PKCE values in sessionStorage for the background authorize flow.
 * This is the browser-only path — server-side callers handle storage themselves.
 */
function storePkceValues(
  clientId: string,
  result: AuthorizeUrlResult,
  options: GetAuthorizationUrlOptions,
): void {
  const storageKey = `FR-SDK-authflow-${clientId}`;
  globalThis.sessionStorage.setItem(
    storageKey,
    JSON.stringify({
      ...options,
      state: result.state,
      verifier: result.verifier,
    }),
  );
}

export function handleResponseµ(
  response: AuthorizationSuccess | AuthorizationError,
  wellknown: WellknownResponse,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> {
  if ('code' in response) {
    return Micro.sync(() => response);
  } else {
    return createAuthorizeErrorµ(response, wellknown, options);
  }
}

/**
 * Constructs the slim PAR authorize URL containing only client_id and request_uri
 * (and optionally prompt). Keeping sensitive params out of the browser address bar
 * is the core security value of PAR (RFC 9126).
 */
export function buildParAuthorizeUrl({
  authorizationEndpoint,
  clientId,
  requestUri,
  prompt,
}: ParUrlParams): string {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('request_uri', requestUri);
  if (prompt) url.searchParams.set('prompt', prompt);
  return url.toString();
}
