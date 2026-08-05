/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { logger as loggerFn } from '@forgerock/sdk-logger';
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';
import { createStorage } from '@forgerock/storage';
import { Cause, Effect, Exit, Option } from 'effect';

import { authorizeµ, createParAuthorizeUrlµ } from './authorize.request.js';
import { buildTokenExchangeµ } from './exchange.request.js';
import { createClientStore, createTokenError, injectIntoStore } from './client.store.utils.js';
import { handleExit } from '@forgerock/sdk-utilities';
import { isExpiryWithinThreshold } from './token.utils.js';
import { logoutµ } from './logout.request.js';
import { oidcApi } from './oidc.api.js';
import { sessionCheckNoneµ, sessionCheckIdTokenµ } from './session.micros.js';
import { wellknownApi, wellknownSelector } from '@forgerock/sdk-wellknown';

import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GenericError, GetAuthorizationUrlOptions, SdkStore } from '@forgerock/sdk-types';
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
import type { SessionCheckOptions, SessionCheckSuccess } from './session.types.js';

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
export async function oidc<ActionType extends ActionTypes = ActionTypes>(
  {
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
  },
  sharedStore?: SdkStore,
) {
  const log = loggerFn({
    level: logger?.level ?? config.log ?? 'error',
    custom: logger?.custom,
  });
  const oauthThreshold = config.oauthThreshold || 30 * 1000; // Default to 30 seconds
  const storageClient = createStorage<OauthTokens>({
    type: storage?.type || 'localStorage',
    name: storage?.name || config.clientId,
    prefix: storage?.prefix || 'pic',
    ...storage,
  } as StorageConfig);
  if (sharedStore && requestMiddleware?.length) {
    log.warn(
      '`requestMiddleware` is ignored when a `sharedStore` is provided. ' +
        'Pass request middleware to the davinci() or journey() factory that owns the store.',
    );
  }
  const store = sharedStore
    ? injectIntoStore(sharedStore)
    : createClientStore({ requestMiddleware, logger: log });

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
    return {
      error: `Failed to fetch well-known configuration from: ${wellknownUrl}`,
      type: 'wellknown_error',
    };
  }

  if (data?.require_pushed_authorization_requests && config.par === false) {
    return {
      error:
        'The authorization server requires Pushed Authorization Requests (PAR). Set config.par to true or omit it.',
      type: 'argument_error',
    };
  }

  const useParFlow = config.par ?? data?.require_pushed_authorization_requests === true;

  return {
    // Pass store methods to the client
    subscribe: store.subscribe,

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
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          return {
            error: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          };
        }

        if (useParFlow) {
          const result = await Effect.runPromiseExit(
            createParAuthorizeUrlµ(wellknown, config, log, store, options).pipe(
              Effect.tapError((err) =>
                Effect.sync(() =>
                  log.error(`PAR authorize.url() failed [${err.type}]: ${err.error}`, err),
                ),
              ),
            ),
          );

          if (Exit.isSuccess(result)) {
            return result.value;
          }
          const authUrlFailure = Cause.findErrorOption(result.cause);
          if (Option.isSome(authUrlFailure)) {
            const authErr = authUrlFailure.value;
            return {
              error: authErr.error,
              message: authErr.error_description,
              type: authErr.type,
            };
          }
          const authUrlDefect = Cause.squash(result.cause);
          return {
            error: 'PAR authorization failure',
            message:
              authUrlDefect instanceof Error
                ? authUrlDefect.message
                : String(authUrlDefect ?? 'Unknown defect'),
            type: 'auth_error',
          };
        }

        const optionsWithDefaults = {
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          scope: config.scope || 'openid',
          responseType: config.responseType || 'code',
          ...(config.loginHint !== undefined && { loginHint: config.loginHint }),
          ...(config.nonce !== undefined && { nonce: config.nonce }),
          ...(config.display !== undefined && { display: config.display }),
          ...(config.prompt !== undefined && { prompt: config.prompt }),
          ...(config.uiLocales !== undefined && { uiLocales: config.uiLocales }),
          ...(config.acrValues !== undefined && { acrValues: config.acrValues }),
          ...(config.query !== undefined && { query: config.query }),
          ...options,
        };

        return createAuthorizeUrl(wellknown.authorization_endpoint, optionsWithDefaults);
      },

      /**
       * @function background - Initiates the authorization process in the background, returning code and state or an error.
       * @param {GetAuthorizationUrlOptions} options - Optional parameters to customize the authorization URL.
       * @returns {Promise<AuthorizeErrorResponse | AuthorizeSuccessResponse>} - Returns a promise that resolves to code and state or an error response.
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

        const result = await Effect.runPromiseExit(
          authorizeµ(wellknown, config, log, store, options, useParFlow),
        );

        if (Exit.isSuccess(result)) {
          return result.value;
        }
        const bgAuthFailure = Cause.findErrorOption(result.cause);
        if (Option.isSome(bgAuthFailure)) {
          return bgAuthFailure.value;
        }
        const bgAuthDefect = Cause.squash(result.cause);
        return {
          error: 'Authorization failure',
          error_description:
            bgAuthDefect instanceof Error
              ? bgAuthDefect.message
              : String(bgAuthDefect ?? 'Unknown defect'),
          type: 'auth_error',
        };
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
        }).pipe(Effect.tap((tokens) => Effect.promise(() => storageClient.set(tokens))));

        const result = await Effect.runPromiseExit(getTokensµ);
        return handleExit(result, 'Token Exchange failure', 'exchange_error');
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
          useParFlow,
        ).pipe(
          Effect.flatMap(
            (response): Effect.Effect<OauthTokens, TokenExchangeErrorResponse, never> => {
              return buildTokenExchangeµ({
                code: response.code,
                config,
                log,
                state: response.state,
                endpoint: wellknown.token_endpoint,
                store,
                options: storageOptions,
              });
            },
          ),
          Effect.tap((newTokens) =>
            Effect.promise(async () => {
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
          ),
        );

        const result = await Effect.runPromiseExit(attemptAuthorizeGetTokensµ);

        if (Exit.isSuccess(result)) {
          return result.value;
        }
        const tokenGetFailure = Cause.findErrorOption(result.cause);
        if (Option.isSome(tokenGetFailure)) {
          return tokenGetFailure.value;
        }
        const tokenGetDefect = Cause.squash(result.cause);
        return {
          error: 'Background token renewal failed',
          error_description:
            tokenGetDefect instanceof Error
              ? tokenGetDefect.message
              : String(tokenGetDefect ?? 'Unknown defect'),
          type: 'auth_error',
        };
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

        const revokeµ = Effect.promise(() =>
          store.dispatch(
            oidcApi.endpoints.revoke.initiate({
              accessToken: tokens.accessToken,
              clientId: config.clientId,
              endpoint: wellknown.revocation_endpoint,
            }),
          ),
        ).pipe(
          Effect.map(({ error }) => {
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
          Effect.flatMap((revokeResponse) =>
            Effect.promise(() => storageClient.remove()).pipe(
              Effect.flatMap((deleteResponse) => {
                const isInnerRequestError =
                  (revokeResponse && 'error' in revokeResponse) ||
                  (deleteResponse && 'error' in deleteResponse);

                if (isInnerRequestError) {
                  const result: RevokeErrorResult = {
                    error: 'Inner request error',
                    revokeResponse,
                    deleteResponse,
                  };
                  return Effect.fail(result);
                } else {
                  const result: RevokeSuccessResult = {
                    revokeResponse: null,
                    deleteResponse: null,
                  };
                  return Effect.succeed(result);
                }
              }),
            ),
          ),
        );

        const result = await Effect.runPromiseExit(revokeµ);
        return handleExit(result, 'Token revocation failure', 'auth_error');
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

        const info = Effect.promise(() =>
          store.dispatch(
            oidcApi.endpoints.userInfo.initiate({
              accessToken: tokens.accessToken,
              endpoint: wellknown.userinfo_endpoint,
            }),
          ),
        ).pipe(
          Effect.flatMap(({ data, error }) => {
            if (error) {
              let message = 'An error occurred while fetching user info';
              let status: number | string = 'unknown';
              if ('message' in error && error.message) {
                message = error.message;
              }
              if ('status' in error) {
                status = error.status;
              }
              return Effect.fail({
                error: 'User Info retrieval failure',
                message,
                type: 'auth_error',
                status,
              } as const);
            }
            return Effect.succeed(data);
          }),
        );

        const result = await Effect.runPromiseExit(info);
        return handleExit(result, 'User Info retrieval failure', 'auth_error');
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

        const result = await Effect.runPromiseExit(
          logoutµ({ tokens, config, wellknown, store, storageClient }),
        );
        return handleExit(result, 'Logout_Failure', 'auth_error');
      },

      /**
       * @method session
       * @description Checks whether the user has an active session at the authorization server
       *              using a hidden iframe with prompt=none. Supports response_type=none (default)
       *              and response_type=id_token.
       * @param {SessionCheckOptions} options - Optional parameters for the session check.
       * @returns {Promise<SessionCheckSuccess | GenericError>} - Never throws; returns a typed result.
       */
      session: async (
        options?: SessionCheckOptions,
      ): Promise<SessionCheckSuccess | GenericError> => {
        const state = store.getState();
        const wellknown = wellknownSelector(wellknownUrl, state);

        if (!wellknown?.authorization_endpoint) {
          return {
            error: 'Wellknown missing authorization endpoint',
            message: 'Authorization endpoint not found in wellknown configuration',
            type: 'wellknown_error',
          };
        }

        const effect =
          options?.responseType === 'id_token'
            ? sessionCheckIdTokenµ(wellknown, config, store, storageClient, log, options)
            : sessionCheckNoneµ(wellknown, config, store, storageClient, log, options);

        const result = await Effect.runPromiseExit(effect);
        return handleExit(result, 'Session check failure', 'unknown_error');
      },
    },
  };
}
