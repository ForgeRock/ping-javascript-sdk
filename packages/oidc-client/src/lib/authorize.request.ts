/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomLogger } from '@forgerock/sdk-logger';
import { Micro } from 'effect';

import {
  createAuthorizeUrlµ,
  buildAuthorizeOptionsµ,
  createAuthorizeErrorµ,
} from './authorize.request.utils.js';
import { oidcApi } from './oidc.api.js';

import type { ClientStore } from './client.types.js';
import type { GetAuthorizationUrlOptions, WellknownResponse } from '@forgerock/sdk-types';
import type { AuthorizationError, AuthorizationSuccess } from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

/**
 * @function authorizeµ
 * @description Creates an authorization URL for the OIDC client.
 * @param {WellKnownResponse} wellknown - The well-known configuration for the OIDC server.
 * @param {OidcConfig} config - The OIDC client configuration.
 * @param {CustomLogger} log - The logger instance for logging debug information.
 * @param {ClientStore} store - The Redux store instance for managing OIDC state.
 * @param {GetAuthorizationUrlOptions} options - Optional parameters for the authorization request.
 * @returns {Micro.Micro<AuthorizationSuccess, AuthorizationError, never>} - A micro effect that resolves to the authorization response.
 */
export function authorizeµ(
  wellknown: WellknownResponse,
  config: OidcConfig,
  log: CustomLogger,
  store: ClientStore,
  options?: GetAuthorizationUrlOptions,
) {
  return buildAuthorizeOptionsµ(wellknown, config, options).pipe(
    Micro.flatMap(([url, options]) => createAuthorizeUrlµ(url, options)),
    Micro.tap((url) => log.debug('Authorize URL created', url)),
    Micro.tapError((url) => Micro.sync(() => log.error('Error creating authorize URL', url))),
    Micro.flatMap(
      ([url, options]): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> => {
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
          return Micro.promise(() =>
            store.dispatch(oidcApi.endpoints.authorizeFetch.initiate({ url })),
          ).pipe(
            Micro.flatMap(
              ({ error, data }): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> => {
                if (error) {
                  // Check for serialized error
                  if (!('status' in error)) {
                    // This is a network or fetch error, so return it as-is
                    return Micro.fail({
                      error: error.code || 'Unknown_Error',
                      error_description:
                        error.message || 'An unknown error occurred during authorization',
                      type: 'unknown_error',
                    });
                  }

                  // If there is no data, this is an unknown error
                  if (!('data' in error)) {
                    return Micro.fail({
                      error: 'Unknown_Error',
                      error_description: 'An unknown error occurred during authorization',
                      type: 'unknown_error',
                    });
                  }

                  const errorDetails = error.data as AuthorizationError;

                  // If the error is a configuration issue, return it as-is
                  if ('statusText' in error && error.statusText === 'CONFIGURATION_ERROR') {
                    return Micro.fail(errorDetails);
                  }

                  // If the error is not a configuration issue, we build a new Authorize URL
                  // For redirection, we need to remove `pi.flow` from the options
                  const redirectOptions = options;
                  delete redirectOptions.responseMode;

                  // Create an error with a new Authorize URL
                  return createAuthorizeErrorµ(errorDetails, wellknown, options);
                }

                log.debug('Received success response', data);

                if (data.authorizeResponse) {
                  // Authorization was successful
                  return Micro.succeed(data.authorizeResponse);
                } else {
                  // This should never be reached, but just in case
                  return Micro.fail({
                    error: 'Unknown_Error',
                    error_description: 'Response schema was not recognized',
                    type: 'unknown_error',
                  });
                }
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
          return Micro.promise(() =>
            store.dispatch(oidcApi.endpoints.authorizeIframe.initiate({ url })),
          ).pipe(
            Micro.flatMap(
              ({ error, data }): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> => {
                if (error) {
                  // Check for serialized error
                  if (!('status' in error)) {
                    // This is a network or fetch error, so return it as-is
                    return Micro.fail({
                      error: error.code || 'Unknown_Error',
                      error_description:
                        error.message || 'An unknown error occurred during authorization',
                      type: 'unknown_error',
                    });
                  }

                  // If there is no data, this is an unknown error
                  if (!('data' in error)) {
                    return Micro.fail({
                      error: 'Unknown_Error',
                      error_description: 'An unknown error occurred during authorization',
                      type: 'unknown_error',
                    });
                  }

                  const errorDetails = error.data as AuthorizationError;

                  // If the error is a configuration issue, return it as-is
                  if ('statusText' in error && error.statusText === 'CONFIGURATION_ERROR') {
                    return Micro.fail(errorDetails);
                  }

                  // This is an expected error, so combine error with a new Authorize URL
                  return createAuthorizeErrorµ(errorDetails, wellknown, options);
                }

                log.debug('Received success response', data);

                if (data) {
                  // Authorization was successful
                  return Micro.succeed(data);
                } else {
                  // This should never be reached, but just in case
                  return Micro.fail({
                    error: 'Unknown_Error',
                    error_description: 'Redirect parameters was not recognized',
                    type: 'unknown_error',
                  });
                }
              },
            ),
          );
        }
      },
    ),
  );
}
