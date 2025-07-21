/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomLogger, logger as loggerFn, LogLevel } from '@forgerock/sdk-logger';
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import { createStorage, StorageConfig } from '@forgerock/storage';
import { Micro } from 'effect';
import { exitIsFail, exitIsSuccess } from 'effect/Micro';

import { authorizeµ } from './authorize.request.js';
import { createClientStore } from './client.store.utils.js';
import { createValuesµ, handleTokenResponseµ, validateValuesµ } from './exchange.utils.js';
import { GenericError } from './error.types.js';
import { oidcApi } from './oidc.api.js';
import { wellknownApi, wellknownSelector } from './wellknown.api.js';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

import type { OidcConfig } from './config.types.js';
import type { AuthorizeErrorResponse } from './authorize.request.types.js';
import type { TokenExchangeErrorResponse } from './exchange.types.js';

export async function oidc<ActionType extends ActionTypes = ActionTypes>({
  config,
  requestMiddleware,
  logger,
  storage,
}: {
  config: OidcConfig;
  requestMiddleware?: RequestMiddleware<ActionType>[];
  logger?: {
    level: LogLevel;
    custom?: CustomLogger;
  };
  storage?: Partial<StorageConfig>;
}) {
  const log = loggerFn({ level: logger?.level || 'error', custom: logger?.custom });
  const storageClient = createStorage({
    type: 'localStorage',
    name: 'oidcTokens',
    ...storage,
  } as StorageConfig);
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
        } else if (exitIsFail(result)) {
          return result.cause.error;
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
      exchange: async (code: string, state: string, options?: Partial<StorageConfig>) => {
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

        const buildTokenExchangeµ = Micro.sync(() =>
          createValuesµ(code, config, state, wellknown, options),
        ).pipe(
          Micro.flatMap((options) => validateValuesµ(options)),
          Micro.flatMap((requestOptions) =>
            Micro.promise(
              async () => await store.dispatch(oidcApi.endpoints.exchange.initiate(requestOptions)),
            ),
          ),
          Micro.flatMap(({ data, error }) => handleTokenResponseµ(data, error)),
          Micro.flatMap((data) =>
            Micro.promise(async () => {
              await storageClient.set(data);
              return data;
            }),
          ),
        );

        const result = await Micro.runPromiseExit(buildTokenExchangeµ);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result) && 'error' in result.cause) {
          return result.cause.error;
        } else {
          return {
            error: 'Token Exchange failure',
            message: result.cause.message,
            type: 'exchange_error',
          } as TokenExchangeErrorResponse;
        }
      },
    },
  };
}
