/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { CustomLogger, logger as loggerFn, LogLevel } from '@forgerock/sdk-logger';
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import { exitIsSuccess } from 'effect/Micro';

import { authorizeµ } from './authorize.request.js';
import { createClientStore } from './client.store.utils.js';
import { GenericError } from './error.types.js';
import { wellknownApi, wellknownSelector } from './wellknown.api.js';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

import type { OidcConfig } from './config.types.js';
import { Micro } from 'effect';

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
      message: 'Requires a wellknown url initializing this factory.',
      type: 'argument_error',
    };
  }
  if (!config?.clientId) {
    return {
      message: 'Requires a clientId.',
      type: 'argument_error',
    };
  }

  const wellknownUrl = config.serverConfig.wellknown;
  const { data, error } = await store.dispatch(
    wellknownApi.endpoints.configuration.initiate(wellknownUrl),
  );

  if (error || !data) {
    return {
      message: `Error fetching wellknown config`,
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
            message: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          } as const;

          log.error(err.message);

          return err;
        }

        return createAuthorizeUrl(wellknown.authorization_endpoint, optionsWithDefaults);
      },
      background: async (options?: GetAuthorizationUrlOptions) => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          const err = {
            message: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          } as const;

          log.error(err.message);

          return err;
        }

        const result = await Micro.runPromiseExit(
          await authorizeµ(wellknown, config, log, options),
        );

        if (exitIsSuccess(result)) {
          return result.value;
        } else {
          return result.cause;
        }
      },
    },
  };
}
