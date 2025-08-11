/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import { Micro } from 'effect';

import { iFrameManager, ResolvedParams } from '@forgerock/iframe-manager';

import type { WellKnownResponse, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

import type {
  AuthorizeErrorResponse,
  AuthorizeSuccessResponse,
} from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

/**
 * @function authorizeFetchµ
 * @description Fetches the authorization response from the given URL.
 * @param {string} url - The URL to fetch the authorization response from.
 * @returns {Micro.Micro<AuthorizeSuccessResponse, AuthorizeErrorResponse, never>} - A micro effect that resolves to the authorization response.
 */
export function authorizeFetchµ(
  url: string,
): Micro.Micro<AuthorizeSuccessResponse | AuthorizeErrorResponse, AuthorizeErrorResponse, never> {
  return Micro.tryPromise({
    try: async () => {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      const resJson = (await response.json()) as
        | { authorizeResponse: AuthorizeSuccessResponse }
        | unknown;

      if (!resJson || typeof resJson !== 'object') {
        return {
          error: 'Authorization Network Failure',
          error_description: 'Failed to fetch authorization response',
          type: 'auth_error',
        };
      }

      if ('authorizeResponse' in resJson) {
        // Return authorizeResponse as it contains the code and state
        return resJson.authorizeResponse as AuthorizeSuccessResponse;
      } else if ('details' in resJson && resJson.details && Array.isArray(resJson.details)) {
        const details = resJson.details[0] as { code: string; message: string };
        // Return error response
        return {
          error: details.code || 'Unknown_Error',
          error_description: details.message || 'An error occurred during authorization',
          type: 'auth_error',
        };
      }

      // Unrecognized response format
      return {
        error: 'Authorization Network Failure',
        error_description: 'Unexpected response format from authorization endpoint',
        type: 'auth_error',
      };
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

/**
 * @function authorizeIframeµ
 * @description Fetches the authorization response from the given URL using an iframe.
 * @param {string} url - The authorization URL to be used for the iframe.
 * @param {OidcConfig} config - The OIDC client configuration.
 * @returns {Micro.Micro<ResolvedParams, AuthorizeErrorResponse, never>}
 */
export function authorizeIframeµ(
  url: string,
  config: OidcConfig,
): Micro.Micro<ResolvedParams, AuthorizeErrorResponse, never> {
  return Micro.tryPromise({
    try: () => {
      const params = iFrameManager().getParamsByRedirect({
        url,
        /***
         * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
         * The client MUST ignore unrecognized response parameters.
         */
        successParams: ['code', 'state'],
        errorParams: ['error', 'error_description'],
        timeout: config.serverConfig.timeout || 3000,
      });
      return params;
    },
    catch: (err) => {
      let message = 'Error calling authorization URL';
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

type BuildAuthorizationData = [string, OidcConfig, GetAuthorizationUrlOptions];
export type OptionalAuthorizeOptions = Partial<GetAuthorizationUrlOptions>;

/**
 * @function buildAuthorizeOptionsµ
 * @description Builds the authorization options for the OIDC client.
 * @param {WellKnownResponse} wellknown - The well-known configuration for the OIDC server.
 * @param {OidcConfig} config - The OIDC client configuration.
 * @param {OptionalAuthorizeOptions} options - Optional parameters for the authorization request.
 * @returns {Micro.Micro<BuildAuthorizationData, AuthorizeErrorResponse, never>}
 */
export function buildAuthorizeOptionsµ(
  wellknown: WellKnownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): Micro.Micro<BuildAuthorizationData, AuthorizeErrorResponse, never> {
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
  config: OidcConfig,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<never, AuthorizeErrorResponse, never> {
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
      } as AuthorizeErrorResponse;
    },
  }).pipe(
    Micro.flatMap((url) => {
      return Micro.fail({
        error: res.error,
        error_description: res.error_description,
        type: 'auth_error',
        redirectUrl: url,
      } as AuthorizeErrorResponse);
    }),
  );
}

/**
 * @function createAuthorizeUrlµ
 * @description Creates an authorization URL and related options/config for the Authorize request.
 * @param {string} path - The path to the authorization endpoint.
 * @param { OidcConfig } config - The OIDC client configuration.
 * @param { GetAuthorizationUrlOptions } options - Optional parameters for the authorization request.
 * @returns { Micro.Micro<[string, OidcConfig, GetAuthorizationUrlOptions], AuthorizeErrorResponse, never> }
 */
export function createAuthorizeUrlµ(
  path: string,
  config: OidcConfig,
  options: GetAuthorizationUrlOptions,
): Micro.Micro<[string, OidcConfig, GetAuthorizationUrlOptions], AuthorizeErrorResponse, never> {
  return Micro.tryPromise({
    try: async () => [
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
