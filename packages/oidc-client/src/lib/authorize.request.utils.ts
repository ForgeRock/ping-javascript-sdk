/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import { Micro } from 'effect';

import type { WellKnownResponse, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

import type { AuthorizationError, AuthorizationSuccess } from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

type BuildAuthorizationData = [string, GetAuthorizationUrlOptions];
export type OptionalAuthorizeOptions = Partial<GetAuthorizationUrlOptions>;

/**
 * @function buildAuthorizeOptionsµ
 * @description Builds the authorization options for the OIDC client.
 * @param {WellKnownResponse} wellknown - The well-known configuration for the OIDC server.
 * @param {OptionalAuthorizeOptions} options - Optional parameters for the authorization request.
 * @returns {Micro.Micro<BuildAuthorizationData, AuthorizeErrorResponse, never>}
 */
export function buildAuthorizeOptionsµ(
  wellknown: WellKnownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): Micro.Micro<BuildAuthorizationData, AuthorizationError, never> {
  const isPiFlow = wellknown.response_modes_supported?.includes('pi.flow');
  return Micro.sync(
    (): BuildAuthorizationData => [
      wellknown.authorization_endpoint,
      {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        scope: config.scope || 'openid',
        responseType: config.responseType || 'code',
        ...(isPiFlow && { responseMode: 'pi.flow' }),
        ...options,
      },
    ],
  );
}

/**
 * @function createAuthorizeErrorµ
 * @description Creates an error response with new Authorize URL for the authorization request.
 * @param { error: string; error_description: string } res - The error response from the authorization request.
 * @param {WellKnownResponse} wellknown- The well-known configuration for the OIDC server.
 * @param { OidcConfig } config- The OIDC client configuration.
 * @param { GetAuthorizationUrlOptions } options- Optional parameters for the authorization request.
 * @returns { Micro.Micro<never, AuthorizeErrorResponse, never> }
 */
export function createAuthorizeErrorµ(
  res: { error: string; error_description: string },
  wellknown: WellKnownResponse,
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
    Micro.flatMap((url) => {
      return Micro.fail({
        error: res.error,
        error_description: res.error_description,
        type: 'auth_error',
        redirectUrl: url,
      } as const);
    }),
  );
}

/**
 * @function createAuthorizeUrlµ
 * @description Creates an authorization URL and related options/config for the Authorize request.
 * @param {string} path - The path to the authorization endpoint.
 * @param { GetAuthorizationUrlOptions } options - Optional parameters for the authorization request.
 * @returns { Micro.Micro<[string, GetAuthorizationUrlOptions], AuthorizationError, never> }
 */
export function createAuthorizeUrlµ(
  path: string,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<[string, GetAuthorizationUrlOptions], AuthorizationError, never> {
  return Micro.tryPromise({
    try: async () => [
      await createAuthorizeUrl(path, {
        ...options,
        prompt: 'none',
      }),
      options,
    ],
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

export function handleResponseµ(
  response: AuthorizationSuccess | AuthorizationError,
  wellknown: WellKnownResponse,
  config: OidcConfig,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> {
  if ('code' in response) {
    return Micro.sync(() => response);
  } else {
    return createAuthorizeErrorµ(response, wellknown, options);
  }
}
