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
import { AuthorizeSuccessResponse } from './authorize.request.types.js';

export async function authorizeµ(
  wellknown: WellKnownResponse,
  config: OidcConfig,
  log: CustomLogger,
  options?: GetAuthorizationUrlOptions,
) {
  const buildAuthorizeRequestµ = buildAuthorizeOptionsµ(wellknown, config, options).pipe(
    Micro.flatMap(([url, config, options]) => createAuthorizeUrlµ(url, config, options)),
    (effect) => {
      return Micro.matchEffect(effect, {
        onSuccess: (url) => {
          log.debug('Created authorization URL', { url });
          return effect;
        },
        onFailure: (error) => {
          log.error('Error creating authorization URL', { error });
          return effect;
        },
      });
    },
    Micro.flatMap(([url, config, options]) => {
      if (options.responseMode === 'pi.flow') {
        /**
         * If we support the pi.flow field, this means we are using a PingOne server.
         * PingOne servers do not support redirection through iframes because they
         * set iframe's to DENY.
         */
        return authorizeFetchµ(url).pipe(
          Micro.flatMap((response) => {
            return Micro.gen(function* () {
              if ('authorizeResponse' in response) {
                log.debug('Received authorize response', response.authorizeResponse);
                return yield* Micro.succeed(response.authorizeResponse as AuthorizeSuccessResponse);
              }
              log.error('Error in authorize response', response);
              const errorResponse = response as { error: string; error_description: string };
              return yield* createAuthorizeErrorµ(errorResponse, wellknown, config, options);
            });
          }),
        );
      } else {
        /**
         * If the response mode is not pi.flow, then we are likely using a traditional
         * redirect based server supporting iframes. An example would be PingAM.
         */
        return authorizeIframeµ(url, config).pipe(
          Micro.flatMap((response) => {
            return Micro.gen(function* () {
              if ('code' in response && 'state' in response) {
                log.debug('Received authorization code', response);
                return yield* Micro.succeed(response as unknown as AuthorizeSuccessResponse);
              }
              log.error('Error in authorize response', response);
              const errorResponse = response as { error: string; error_description: string };
              return yield* createAuthorizeErrorµ(errorResponse, wellknown, config, options);
            });
          }),
        );
      }
    }),
  );

  return Micro.runPromiseExit(buildAuthorizeRequestµ);
}
