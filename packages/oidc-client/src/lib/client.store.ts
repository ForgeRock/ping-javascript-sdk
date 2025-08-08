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
import { createClientStore, createLogoutError, createTokenError } from './client.store.utils.js';
import { createValuesµ, handleTokenResponseµ, validateValuesµ } from './exchange.utils.js';
import { oidcApi } from './oidc.api.js';
import { wellknownApi, wellknownSelector } from './wellknown.api.js';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

import type { OauthTokens, OidcConfig } from './config.types.js';
import type {
  AuthorizeErrorResponse,
  AuthorizeSuccessResponse,
} from './authorize.request.types.js';
import type { TokenExchangeErrorResponse, TokenExchangeResponse } from './exchange.types.js';

/**
 * @function oidc
 * @description Factory function to create an OIDC client with methods for authorization, token exchange,
 *              user info retrieval, and logout. It initializes the client with the provided configuration,
 *              request middleware, logger, and storage options.
 * @param parameter - configuration object containing the OIDC client configuration, request middleware, logger,
 * @param {OidcConfig} parameter.config - OIDC configuration including server details, client ID, redirect URI,
 *              storage options, scope, and response type.
 * @param {RequestMiddleware} parameter.requestMiddleware - optional array of request middleware functions to process requests.
 * @param {{ level: LogLevel, custom: CustomLogger }} parameter.logger - optional logger configuration with log level and custom logger.
 * @param {Partial<StorageConfig>} parameter.storage - optional storage configuration for persisting OIDC tokens.
 * @returns {ReturnType<typeof oidc>} - Returns an object with methods for authorization, token exchange, user info retrieval, and logout.
 */
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
  const storageClient = createStorage<OauthTokens>({
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
    /**
     * An object containing methods for the creation, and background use, of the authorization URL
     */
    authorize: {
      /**
       * @function url
       * @description Creates an authorization URL with the provided options or defaults from the configuration.
       * @param {GetAuthorizationUrlOptions} options - Optional parameters to customize the authorization URL.
       * @returns {Promise<string | GenericError>} - Returns a promise that resolves to the authorization URL or an error.
       */
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
      /**
       * @function background - Initiates the authorization process in the background, returning an authorization URL or an error.
       * @param {GetAuthorizationUrlOptions} options - Optional parameters to customize the authorization URL.
       * @returns {Promise<AuthorizeErrorResponse | AuthorizeSuccessResponse>} - Returns a promise that resolves to the authorization URL or an error response.
       */
      background: async (
        options?: GetAuthorizationUrlOptions,
      ): Promise<AuthorizeErrorResponse | AuthorizeSuccessResponse> => {
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
    /**
     * An object containing methods for token exchange
     */
    token: {
      /**
       * @function exchange
       * @description Exchanges an authorization code for tokens using the token endpoint from the wellknown configuration
       *              and stores them in the configured storage.
       * @param {string} code - The authorization code received from the authorization server.
       * @param {string} state - The state parameter from the authorization URL creation.
       * @param {Partial<StorageConfig>} options - Optional storage configuration for persisting tokens.
       * @returns {Promise<TokenExchangeResponse | GenericError | TokenExchangeErrorResponse>}
       */
      exchange: async (
        code: string,
        state: string,
        options?: Partial<StorageConfig>,
      ): Promise<TokenExchangeResponse | GenericError | TokenExchangeErrorResponse> => {
        const storeState = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, storeState);

        if (!wellknown?.token_endpoint) {
          const err = {
            error: 'Wellknown missing token endpoint',
            type: 'wellknown_error',
          } as const;

          log.error(err.error);

          return err;
        }

        const buildTokenExchangeµ = Micro.sync(() =>
          createValuesµ(code, config, state, wellknown, options),
        ).pipe(
          Micro.flatMap((options) => validateValuesµ(options)),
          Micro.flatMap((requestOptions) =>
            Micro.promise(() =>
              store.dispatch(oidcApi.endpoints.exchange.initiate(requestOptions)),
            ),
          ),
          Micro.flatMap(({ data, error }) => handleTokenResponseµ(data, error)),
          Micro.flatMap((data) =>
            Micro.promise(async () => {
              await storageClient.set({
                accessToken: data.access_token,
                idToken: data.id_token,
                refreshToken: data.refresh_token,
                expiresAt: data.expires_in,
              });
              return data;
            }),
          ),
        );

        const result = await Micro.runPromiseExit(buildTokenExchangeµ);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
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
    /**
     * An object containing methods for user info retrieval and logout
     */
    user: {
      /**
       * @function info - Retrieves user information using the userinfo endpoint from the wellknown configuration.
       *                  It requires an access token stored in the configured storage.
       * @returns {Promise<GenericError | TokenExchangeResponse>} - Returns a promise that resolves to user information or an error response.
       */
      info: async (): Promise<GenericError | TokenExchangeResponse> => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.userinfo_endpoint) {
          const err = {
            error: 'Wellknown missing userinfo endpoint',
            type: 'wellknown_error',
          } as AuthorizeErrorResponse;

          log.error(err.error);

          return err;
        }

        const tokens = await storageClient.get();

        if (!tokens || !('accessToken' in tokens)) {
          const err = {
            error: 'No access token found',
            type: 'auth_error',
          } as const;

          log.error(err.error);

          return err;
        }

        const info = Micro.promise(() =>
          store.dispatch(
            oidcApi.endpoints.userInfo.initiate({
              accessToken: tokens.accessToken,
              endpoint: wellknown.userinfo_endpoint,
            }),
          ),
        ).pipe(
          Micro.flatMap(({ data, error }) => {
            if (error) {
              let message = 'An error occurred while fetching user info';
              let status: number | string = 'unknown';
              if ('message' in error && error.message) {
                message = error.message;
              }
              if ('status' in error) {
                status = error.status;
              }
              return Micro.fail({
                error: 'User Info retrieval failure',
                message,
                type: 'auth_error',
                status,
              } as const);
            }
            return Micro.succeed(data);
          }),
        );

        const result = await Micro.runPromiseExit(info);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
          return result.cause.error;
        } else {
          return {
            error: 'User Info retrieval failure',
            message: result.cause.message,
            type: 'auth_error',
          } as const;
        }
      },
      /**
       * @function logout
       * @description Logs out the user by revoking tokens and clearing the storage.
       *              It uses the end session endpoint from the wellknown configuration.
       * @returns {Promise<GenericError | any>} - Returns a promise that resolves to the logout response or an error.
       */
      logout: async (): Promise<
        | GenericError
        | {
            sessionResponse: GenericError | null;
            revokeResponse: GenericError | null;
            deleteResponse: void;
          }
      > => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.end_session_endpoint) {
          const err = {
            error: 'Wellknown missing end session endpoint',
            type: 'wellknown_error',
          } as const;

          log.error(err.error);

          return err;
        }

        const tokens = await storageClient.get();

        if (!tokens) {
          return createTokenError('no_tokens', log);
        }

        if (!('accessToken' in tokens)) {
          return createTokenError('no_access_token', log);
        }

        if (!('idToken' in tokens)) {
          return createTokenError('no_id_token', log);
        }

        const logout = Micro.zip(
          // End session with the ID token
          Micro.promise(() =>
            store.dispatch(
              oidcApi.endpoints.endSession.initiate({
                idToken: tokens.idToken,
                endpoint: wellknown.ping_end_idp_session_endpoint || wellknown.end_session_endpoint,
              }),
            ),
          ).pipe(Micro.map(({ data, error }) => createLogoutError(data, error))),

          // Revoke the access token
          Micro.promise(() =>
            store.dispatch(
              oidcApi.endpoints.revoke.initiate({
                accessToken: tokens.accessToken,
                clientId: config.clientId,
                endpoint: wellknown.revocation_endpoint,
              }),
            ),
          ).pipe(Micro.map(({ data, error }) => createLogoutError(data, error))),
        ).pipe(
          // Delete local token and return combined results
          Micro.flatMap(([sessionResponse, revokeResponse]) =>
            Micro.promise(async () => {
              const deleteResponse = await storageClient.remove();
              return {
                sessionResponse,
                revokeResponse,
                deleteResponse,
              };
            }),
          ),
        );

        const result = await Micro.runPromiseExit(logout);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
          return result.cause.error;
        } else {
          return {
            error: 'Logout_Failure',
            message: result.cause.message,
            type: 'auth_error',
          } as const;
        }
      },
    },
  };
}
