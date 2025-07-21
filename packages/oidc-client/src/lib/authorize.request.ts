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
         */
        return authorizeFetchµ(url).pipe(
          Micro.flatMap(
            (response): Micro.Micro<AuthorizeSuccessResponse, AuthorizeErrorResponse, never> => {
              if ('authorizeResponse' in response) {
                log.debug('Received authorize response', response.authorizeResponse);
                return Micro.succeed(response.authorizeResponse);
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
