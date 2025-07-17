/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomLogger, logger as loggerFn, LogLevel } from '@forgerock/sdk-logger';
import { createAuthorizeUrl, getStoredAuthUrlValues } from '@forgerock/sdk-oidc';
import { createStorage } from '@forgerock/storage';
import { Micro } from 'effect';
import { exitIsSuccess } from 'effect/Micro';

import { authorizeµ } from './authorize.request.js';
import { createClientStore } from './client.store.utils.js';
import { GenericError } from './error.types.js';
import { oidcApi } from './oidc.api.js';
import { wellknownApi, wellknownSelector } from './wellknown.api.js';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

import type { OidcConfig } from './config.types.js';
import { AuthorizeErrorResponse } from './authorize.request.types.js';
import { TokenExchangeOptions } from './client.store.types.js';
import { TokenRequestOptions } from './token.types.js';

export async function oidc<ActionType extends ActionTypes = ActionTypes>({
  config,
  requestMiddleware,
  logger,
}: {
  config: OidcConfig;
  requestMiddleware?: RequestMiddleware<ActionType>[];
  logger?: {
    level: LogLevel;
    custom?: CustomLogger;
  };
}) {
  const log = loggerFn({ level: logger?.level || 'error', custom: logger?.custom });
  const store = createClientStore({ requestMiddleware, logger: log });

  if (!config?.serverConfig?.wellknown) {
    return {
      error: 'Requires a wellknown url initializing this factory.',
      type: 'argument_error',
    };
  }
  if (!config?.clientId) {
    return {
      error: 'Requires a clientId.',
      type: 'argument_error',
    };
  }

  const wellknownUrl = config.serverConfig.wellknown;
  const { data, error } = await store.dispatch(
    wellknownApi.endpoints.configuration.initiate(wellknownUrl),
  );

  if (error || !data) {
    return {
      error: `Error fetching wellknown config`,
      type: 'network_error',
    };
  }

  return {
    authorize: {
      url: async (options?: GetAuthorizationUrlOptions): Promise<string | GenericError> => {
        const optionsWithDefaults = {
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          scope: config.scope || 'openid',
          responseType: config.responseType || 'code',
          ...options,
        };

        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          const err = {
            error: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          } as const;

          log.error(err.error);

          return err;
        }

        return createAuthorizeUrl(wellknown.authorization_endpoint, optionsWithDefaults);
      },
      background: async (options?: GetAuthorizationUrlOptions) => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          const err = {
            error: 'Wellknown missing authorization endpoint',
            error_description: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          } as AuthorizeErrorResponse;

          log.error(err.error);

          return err;
        }

        const result = await Micro.runPromiseExit(
          await authorizeµ(wellknown, config, log, options),
        );

        if (exitIsSuccess(result)) {
          return result.value;
        } else {
          return {
            error: 'Authorization failure',
            error_description: result.cause.message,
            type: 'auth_error',
          } as AuthorizeErrorResponse;
        }
      },
    },
    token: {
      exchange: async (code: string, state: string, options?: TokenExchangeOptions) => {
        const storeState = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, storeState);

        if (!wellknown?.token_endpoint) {
          const err = {
            error: 'Wellknown missing token endpoint',
            type: 'wellknown_error',
          } as AuthorizeErrorResponse;

          log.error(err.error);

          return err;
        }

        // TODO: Validate state
        const values = getStoredAuthUrlValues(config.clientId, options?.prefix);

        if (values.state !== state) {
          const err = {
            error: 'State mismatch',
            type: 'auth_error',
          } as GenericError;

          log.error(err.error);

          return err;
        }

        const requestOptions: TokenRequestOptions = {
          code,
          config,
          endpoint: wellknown.token_endpoint,
        };
        if (values.verifier) {
          requestOptions.verifier = values.verifier;
        }

        const { data, error } = await store.dispatch(
          oidcApi.endpoints.exchange.initiate(requestOptions),
        );

        if (error || !data) {
          const err = {
            error: 'Error exchanging token',
            type: 'network_error',
          } as GenericError;

          log.error(err.error);

          return err;
        }

        // TODO: handle response and errors; if success, store tokens and return them
        createStorage({ storeType: 'localStorage' }, 'oidcTokens', options?.customStorage).set(
          data,
        );

        return data;
      },
    },
  };
}
