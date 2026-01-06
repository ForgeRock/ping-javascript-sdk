/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { logger as loggerFn } from '@forgerock/sdk-logger';
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import { createStorage } from '@forgerock/storage';
import { Micro } from 'effect';
import { exitIsFail, exitIsSuccess } from 'effect/Micro';

import { authorizeµ } from './authorize.request.js';
import { buildTokenExchangeµ } from './exchange.request.js';
import { createClientStore, createTokenError } from './client.store.utils.js';
import { oidcApi } from './oidc.api.js';
import { wellknownApi, wellknownSelector } from './wellknown.api.js';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GenericError, GetAuthorizationUrlOptions } from '@forgerock/sdk-types';
import type { CustomLogger, LogLevel } from '@forgerock/sdk-logger';
import type { StorageConfig } from '@forgerock/storage';

import type {
  GetTokensOptions,
  LogoutErrorResult,
  LogoutSuccessResult,
  RevokeErrorResult,
  RevokeSuccessResult,
  UserInfoResponse,
} from './client.types.js';
import type { OauthTokens, OidcConfig } from './config.types.js';
import type { AuthorizationError, AuthorizationSuccess } from './authorize.request.types.js';
import type { TokenExchangeErrorResponse } from './exchange.types.js';
import { isExpiryWithinThreshold } from './token.utils.js';
import { logoutµ } from './logout.request.js';

/**
 * @function oidc
 * @description Factory function to create an OIDC client with methods for authorization, token exchange,
 *              user info retrieval, and logout. It initializes the client with the provided configuration,
 *              request middleware, logger, and storage options.
 * @param param - configuration object containing the OIDC client configuration, request middleware, logger,
 * @param {OidcConfig} param.config - OIDC configuration including server details, client ID, redirect URI,
 *              storage options, scope, and response type.
 * @param {RequestMiddleware} param.requestMiddleware - optional array of request middleware functions to process requests.
 * @param {{ level: LogLevel, custom: CustomLogger }} param.logger - optional logger configuration with log level and custom logger.
 * @param {Partial<StorageConfig>} param.storage - optional storage configuration for persisting OIDC tokens.
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
  const oauthThreshold = config.oauthThreshold || 30 * 1000; // Default to 30 seconds
  const storageClient = createStorage<OauthTokens>({
    type: storage?.type || 'localStorage',
    name: storage?.name || config.clientId,
    prefix: storage?.prefix || 'pic',
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
    log.error(`Error fetching wellknown config. Please check the URL: ${wellknownUrl}`);
  }

  return {
    /**
     * An object containing methods for the creation, and background use, of the authorization URL
     */
    authorize: {
      /**
       * @method url
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
          return {
            error: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          };
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
      ): Promise<AuthorizationSuccess | AuthorizationError> => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          return {
            error: 'Wellknown missing authorization endpoint',
            error_description: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          };
        }

        const result = await Micro.runPromiseExit(
          await authorizeµ(wellknown, config, log, store, options),
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
          };
        }
      },
    },
    /**
     * An object containing methods for token management
     */
    token: {
      /**
       * @method exchange
       * @description Exchanges an authorization code for tokens using the token endpoint from the wellknown
       *              configuration and stores them in the configured storage.
       * @param {string} code - The authorization code received from the authorization server.
       * @param {string} state - The state parameter from the authorization URL creation.
       * @param {Partial<StorageConfig>} options - Optional storage configuration for persisting tokens.
       * @returns {Promise<OauthTokens | GenericError | TokenExchangeErrorResponse>}
       */
      exchange: async (
        code: string,
        state: string,
        options?: Partial<StorageConfig>,
      ): Promise<OauthTokens | TokenExchangeErrorResponse | GenericError> => {
        const storeState = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, storeState);

        if (!wellknown?.token_endpoint) {
          return {
            error: 'Wellknown missing token endpoint',
            type: 'wellknown_error',
          };
        }

        const getTokensµ = buildTokenExchangeµ({
          code,
          config,
          state,
          log,
          endpoint: wellknown.token_endpoint,
          store,
          options,
        }).pipe(
          Micro.tap(async (tokens) => {
            await storageClient.set(tokens);
          }),
        );

        const result = await Micro.runPromiseExit(getTokensµ);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
          return result.cause.error;
        } else {
          return {
            error: 'Token Exchange failure',
            message: result.cause.message,
            type: 'exchange_error',
          };
        }
      },

      /**
       * @method get
       * @description Retrieves the current OAuth tokens from storage, or auto-renew if backgroundRenew is true.
       * @param {GetTokensOptions} param - An object containing options for the token retrieval.
       * @returns {Promise<OauthTokens | TokenExchangeErrorResponse | AuthorizationError | GenericError>}
       */
      get: async (
        options?: GetTokensOptions,
      ): Promise<OauthTokens | TokenExchangeErrorResponse | AuthorizationError | GenericError> => {
        const { authorizeOptions, forceRenew, backgroundRenew, storageOptions } = options || {};
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          return {
            error: 'Wellknown missing authorization endpoint',
            type: 'wellknown_error',
          };
        }

        const tokens = await storageClient.get();

        // If there's an error, return early as there is an unknown issue from getting tokens
        if (tokens && 'error' in tokens) {
          return {
            error: 'Error occurred while retrieving tokens',
            message: 'Please log the user out completely and try again',
            type: 'state_error',
          };
        }

        // If forceRenew is false, we have tokens, and they are NOT expired, return them
        if (
          !forceRenew &&
          tokens &&
          !isExpiryWithinThreshold(oauthThreshold, tokens.expiryTimestamp)
        ) {
          return tokens;
        }

        // If backgroundRenew and forceRenew is false return token, regardless of expiration, or the "no tokens found" error
        if (!backgroundRenew && !forceRenew) {
          return (
            tokens || {
              error: 'No tokens found',
              type: 'state_error',
            }
          );
        }

        // If we're here, backgroundRenew is true and we have no tokens, expired tokens or forceRenew is true
        const attemptAuthorizeGetTokensµ = authorizeµ(
          wellknown,
          config,
          log,
          store,
          authorizeOptions,
        ).pipe(
          Micro.flatMap((response): Micro.Micro<OauthTokens, TokenExchangeErrorResponse, never> => {
            return buildTokenExchangeµ({
              code: response.code,
              config,
              log,
              state: response.state,
              endpoint: wellknown.token_endpoint,
              store,
              options: storageOptions,
            });
          }),
          Micro.tap(async (newTokens) => {
            if (tokens && 'accessToken' in tokens) {
              await store.dispatch(
                oidcApi.endpoints.revoke.initiate({
                  accessToken: tokens.accessToken,
                  clientId: config.clientId,
                  endpoint: wellknown.revocation_endpoint,
                }),
              );
              await storageClient.remove();
            }
            await storageClient.set(newTokens);
          }),
        );

        const result = await Micro.runPromiseExit(attemptAuthorizeGetTokensµ);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
          return result.cause.error;
        } else {
          return {
            error: 'Background token renewal failed',
            error_description: result.cause.message,
            type: 'auth_error',
          };
        }
      },
      /**
       * @method revoke
       * @description Revokes an access token using the revocation endpoint from the wellknown configuration.
       *              It requires an access token stored in the configured storage.
       * @returns {Promise<GenericError | RevokeSuccessResult | RevokeErrorResult>} - Returns a promise that resolves to the revoke response or an error response.
       */
      revoke: async (): Promise<GenericError | RevokeSuccessResult | RevokeErrorResult> => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.revocation_endpoint) {
          return {
            error: 'Wellknown missing revocation endpoint',
            type: 'wellknown_error',
          };
        }

        const tokens = await storageClient.get();

        if (!tokens || !('accessToken' in tokens)) {
          return {
            error: 'No access token found',
            type: 'state_error',
          };
        }

        const revokeµ = Micro.promise(() =>
          store.dispatch(
            oidcApi.endpoints.revoke.initiate({
              accessToken: tokens.accessToken,
              clientId: config.clientId,
              endpoint: wellknown.revocation_endpoint,
            }),
          ),
        ).pipe(
          Micro.map(({ error }) => {
            if (error) {
              let message = 'An error occurred while revoking the token';
              let status: number | string = 'unknown';
              if ('message' in error && error.message) {
                message = error.message;
              }
              if ('status' in error) {
                status = error.status;
              }
              return {
                error: 'Token revocation failure',
                message,
                type: 'auth_error',
                status,
              } as GenericError;
            }

            return null;
          }),
          // Delete local token and return combined results
          Micro.flatMap((revokeResponse) =>
            Micro.promise(() => storageClient.remove()).pipe(
              Micro.flatMap((deleteResponse) => {
                const isInnerRequestError =
                  (revokeResponse && 'error' in revokeResponse) ||
                  (deleteResponse && 'error' in deleteResponse);

                if (isInnerRequestError) {
                  const result: RevokeErrorResult = {
                    error: 'Inner request error',
                    revokeResponse,
                    deleteResponse,
                  };
                  return Micro.fail(result);
                } else {
                  const result: RevokeSuccessResult = {
                    revokeResponse: null,
                    deleteResponse: null,
                  };
                  return Micro.succeed(result);
                }
              }),
            ),
          ),
        );

        const result = await Micro.runPromiseExit(revokeµ);

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
          return result.cause.error;
        } else {
          return {
            error: 'Token revocation failure',
            message: result.cause.message,
            type: 'auth_error',
          };
        }
      },
    },

    /**
     * An object containing methods for user info retrieval and logout
     */
    user: {
      /**
       * @method info
       * @description Retrieves user information using the userinfo endpoint from the wellknown configuration.
       *              It requires an access token stored in the configured storage.
       * @returns {Promise<GenericError | UserInfoResponse>} - Returns a promise that resolves to user information or an error response.
       */
      info: async (): Promise<GenericError | UserInfoResponse> => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.userinfo_endpoint) {
          return {
            error: 'Wellknown missing userinfo endpoint',
            type: 'wellknown_error',
          };
        }

        const tokens = await storageClient.get();

        if (!tokens || !('accessToken' in tokens)) {
          return {
            error: 'No access token found',
            type: 'auth_error',
          };
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
          };
        }
      },

      /**
       * @method logout
       * @description Logs out the user by revoking tokens and clearing the storage.
       *              It uses the end session endpoint from the wellknown configuration.
       * @returns {Promise<GenericError | LogoutSuccessResult | LogoutErrorResult>} - Returns a promise that resolves to the logout response or an error.
       */
      logout: async (): Promise<GenericError | LogoutSuccessResult | LogoutErrorResult> => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.end_session_endpoint) {
          return {
            error: 'Wellknown missing end session endpoint',
            type: 'wellknown_error',
          };
        }

        if (!wellknown?.revocation_endpoint) {
          return {
            error: 'Wellknown missing revocation endpoint',
            type: 'wellknown_error',
          };
        }

        const tokens = await storageClient.get();

        if (!tokens) {
          return createTokenError('no_tokens');
        }

        if (!('accessToken' in tokens)) {
          return createTokenError('no_access_token');
        }

        if (!('idToken' in tokens)) {
          return createTokenError('no_id_token');
        }

        const result = await Micro.runPromiseExit(
          logoutµ({ tokens, config, wellknown, store, storageClient }),
        );

        if (exitIsSuccess(result)) {
          return result.value;
        } else if (exitIsFail(result)) {
          return result.cause.error;
        } else {
          return {
            error: 'Logout_Failure',
            message: result.cause.message,
            type: 'auth_error',
          };
        }
      },
    },
  };
}
