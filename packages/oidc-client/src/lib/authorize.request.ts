/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomLogger } from '@forgerock/sdk-logger';
import { GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';
import { Micro } from 'effect';

import {
  authorizeFetchµ,
  createAuthorizeUrlµ,
  authorizeIframeµ,
  buildAuthorizeOptionsµ,
  createAuthorizeErrorµ,
} from './authorize.request.utils.js';

import type { WellKnownResponse } from '@forgerock/sdk-types';

import type { OidcConfig } from './config.types.js';
import { AuthorizeErrorResponse, AuthorizeSuccessResponse } from './authorize.request.types.js';

/**
 * @function authorizeµ
 * @description Creates an authorization URL for the OIDC client.
 * @param {WellKnownResponse} wellknown - The well-known configuration for the OIDC server.
 * @param {OidcConfig} config - The OIDC client configuration.
 * @param {CustomLogger} log - The logger instance for logging debug information.
 * @param {GetAuthorizationUrlOptions} options - Optional parameters for the authorization request.
 * @returns {Micro.Micro<AuthorizeSuccessResponse, AuthorizeErrorResponse, never>} - A micro effect that resolves to the authorization response.
 */
export async function authorizeµ(
  wellknown: WellKnownResponse,
  config: OidcConfig,
  log: CustomLogger,
  options?: GetAuthorizationUrlOptions,
) {
  return buildAuthorizeOptionsµ(wellknown, config, options).pipe(
    Micro.flatMap(([url, config, options]) => createAuthorizeUrlµ(url, config, options)),
    Micro.tap((url) => log.debug('Authorize URL created', url)),
    Micro.tapError((url) => Micro.sync(() => log.error('Error creating authorize URL', url))),
    Micro.flatMap(([url, config, options]) => {
      if (options.responseMode === 'pi.flow') {
        /**
         * If we support the pi.flow field, this means we are using a PingOne server.
         * PingOne servers do not support redirection through iframes because they
         * set iframe's to DENY.
         *
         * We do not use RTK Query for this because we don't want caching, or store
         * updates, and want the request to be made similar to the iframe method below.
         *
         * This returns a Micro that resolves to the parsed response JSON.
         */
        return authorizeFetchµ(url).pipe(
          Micro.flatMap(
            (response): Micro.Micro<AuthorizeSuccessResponse, AuthorizeErrorResponse, never> => {
              if ('code' in response) {
                log.debug('Received code in response', response);
                return Micro.succeed(response);
              }
              log.error('Error in authorize response', response);
              // For redirection, we need to remore `pi.flow` from the options
              const redirectOptions = options;
              delete redirectOptions.responseMode;
              return createAuthorizeErrorµ(response, wellknown, config, options);
            },
          ),
        );
      } else {
        /**
         * If the response mode is not pi.flow, then we are likely using a traditional
         * redirect based server supporting iframes. An example would be PingAM.
         *
         * This returns a Micro that's either the success URL parameters or error URL
         * parameters.
         */
        return authorizeIframeµ(url, config).pipe(
          Micro.flatMap(
            (response): Micro.Micro<AuthorizeSuccessResponse, AuthorizeErrorResponse, never> => {
              if ('code' in response && 'state' in response) {
                log.debug('Received authorization code', response);
                return Micro.succeed(response as unknown as AuthorizeSuccessResponse);
              }
              log.error('Error in authorize response', response);
              const errorResponse = response as unknown as AuthorizeErrorResponse;
              return createAuthorizeErrorµ(errorResponse, wellknown, config, options);
            },
          ),
        );
      }
    }),
  );
}
