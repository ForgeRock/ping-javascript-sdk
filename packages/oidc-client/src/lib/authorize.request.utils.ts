/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createAuthorizeUrl, GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';
import { Micro } from 'effect';

import { iFrameManager } from '@forgerock/iframe-manager';

import type { WellKnownResponse } from '@forgerock/sdk-types';

import type {
  AuthorizeErrorResponse,
  AuthorizeSuccessResponse,
} from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

export function authorizeFetchµ(url: string) {
  return Micro.tryPromise({
    try: async () => {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      return (await response.json()) as
        | { authorizeResponse: AuthorizeSuccessResponse }
        | AuthorizeErrorResponse;
    },
    catch: (err) => {
      let message = 'Error fetching authorization URL';
      if (err instanceof Error) {
        message = err.message;
      }

      return {
        error: 'Authorization Network Failure',
        error_description: message,
        type: 'auth_error',
      } as AuthorizeErrorResponse;
    },
  });
}

export function authorizeIframeµ(url: string, config: OidcConfig) {
  return Micro.tryPromise({
    try: () =>
      iFrameManager().getParamsByRedirect({
        url,
        /***
         * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
         * The client MUST ignore unrecognized response parameters.
         */
        successParams: ['code', 'state'],
        errorParams: ['error', 'error_description'],
        timeout: config.serverConfig.timeout || 3000,
      }),
    catch: (err) => {
      let message = 'Error fetching authorization URL';
      if (err instanceof Error) {
        message = err.message;
      }

      return {
        error: 'Authorization Notwork Failure',
        error_description: message,
        type: 'auth_error',
      } as AuthorizeErrorResponse;
    },
  });
}

type BuildAuthorizationData = [string, OidcConfig, GetAuthorizationUrlOptions];
export type OptionalAuthorizeOptions = Partial<GetAuthorizationUrlOptions>;
export function buildAuthorizeOptionsµ(
  wellknown: WellKnownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
) {
  const isPiFlow = wellknown.response_modes_supported?.includes('pi.flow');
  return Micro.sync(
    (): BuildAuthorizationData => [
      wellknown.authorization_endpoint,
      config,
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

export function createAuthorizeErrorµ(
  res: { error: string; error_description: string },
  wellknown: WellKnownResponse,
  config: OidcConfig,
  options: GetAuthorizationUrlOptions,
) {
  return Micro.tryPromise({
    try: async () => {
      const url = await createAuthorizeUrl(wellknown.authorization_endpoint, {
        ...options,
      });
      return {
        error: res.error,
        error_description: res.error_description,
        type: 'auth_error',
        redirectUrl: url,
      } as AuthorizeErrorResponse;
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
      } as AuthorizeErrorResponse;
    },
  });
}

export function createAuthorizeUrlµ(
  path: string,
  config: OidcConfig,
  options: GetAuthorizationUrlOptions,
) {
  return Micro.tryPromise({
    try: async (): Promise<[string, OidcConfig, GetAuthorizationUrlOptions]> => [
      await createAuthorizeUrl(path, {
        ...options,
        prompt: 'none',
      }),
      config,
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
      } as AuthorizeErrorResponse;
    },
  });
}
