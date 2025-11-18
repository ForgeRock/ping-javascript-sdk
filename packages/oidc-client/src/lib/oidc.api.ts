/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import {
  createApi,
  fetchBaseQuery,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import type { OidcConfig } from './config.types.js';
import { transformError } from './oidc.api.utils.js';
import { iFrameManager } from '@forgerock/iframe-manager';
import {
  initQuery,
  type ActionTypes,
  type RequestMiddleware,
} from '@forgerock/sdk-request-middleware';

import type { logger as loggerFn } from '@forgerock/sdk-logger';
import type { TokenExchangeResponse } from './exchange.types.js';
import type { AuthorizationSuccess, AuthorizeSuccessResponse } from './authorize.request.types.js';
import type { UserInfoResponse } from './client.types.js';

interface Extras<ActionType extends ActionTypes = ActionTypes, Payload = unknown> {
  requestMiddleware: RequestMiddleware<ActionType, Payload>[];
  logger: ReturnType<typeof loggerFn>;
}

export const oidcApi = createApi({
  reducerPath: 'oidc',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    authorizeFetch: builder.mutation<AuthorizeSuccessResponse, { url: string }>({
      queryFn: async ({ url }, api, _, baseQuery) => {
        const { requestMiddleware, logger } = api.extra as Extras;

        const request: FetchArgs = {
          url,
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        };

        logger.debug('OIDC authorize API request', request);

        const response = await initQuery(request, 'authorize')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        if (response.error) {
          const responseError = response.error;

          // If the details field is present in data, use it to create a more specific error response
          if (
            responseError.data &&
            typeof responseError.data === 'object' &&
            'details' in responseError.data &&
            Array.isArray(responseError.data.details)
          ) {
            logger.debug('Error in authorize response', responseError);

            const details = responseError.data.details[0] as {
              code: string;
              message: string;
            };

            response.error = {
              status: responseError.status,
              statusText: 'AUTHORIZE_ERROR',
              data: {
                error: details.code,
                error_description: details.message,
                type: 'auth_error',
              },
            } as FetchBaseQueryError;
            return response;
          }

          logger.error('Error in OAuth configuration', responseError);

          // Since this is likely a configuration issue, avoid providing a redirect URL
          response.error = {
            status: responseError.status,
            statusText: 'CONFIGURATION_ERROR',
            data: {
              error: 'CONFIGURATION_ERROR',
              error_description:
                'Configuration error. Please check your OAuth configuration, like clientId or allowed redirect URLs.',
              type: 'network_error',
            },
          } as FetchBaseQueryError;
          return response;
        }

        logger.debug('OIDC Authorize fetch API response', response);

        return response as { data: AuthorizeSuccessResponse };
      },
    }),
    authorizeIframe: builder.mutation<AuthorizationSuccess, { url: string }>({
      queryFn: async ({ url }, api) => {
        const { requestMiddleware, logger } = api.extra as Extras;

        const request: FetchArgs = {
          url,
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        };

        logger.debug('OIDC authorize API request', request);

        const response = await initQuery(request, 'authorize')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => {
            try {
              const res = await iFrameManager().getParamsByRedirect({
                url: req.url,
                /***
                 * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
                 * The client MUST ignore unrecognized response parameters.
                 */
                successParams: ['code', 'state'],
                errorParams: ['error', 'error_description'],
                timeout: req.timeout || 3000,
              });
              return { data: res };
            } catch (error) {
              return {
                error: {
                  status: 400,
                  message: 'Unknown error occurred calling authorize endpoint',
                  data: error,
                },
              };
            }
          });

        if ('error' in response) {
          logger.error('Received authorization code', response);
          return {
            error: {
              status: 400,
              statusText: 'CONFIGURATION_ERROR',
              data: {
                error: 'CONFIGURATION_ERROR',
                error_description:
                  'Configuration error. Please check your OAuth configuration, like clientId or allowed redirect URLs.',
                type: 'network_error',
              },
            },
          };
        }

        const data = response.data as {
          code?: string;
          state?: string;
          error?: string;
          error_description?: string;
        };

        // TODO: Consider refactoring iframe manager to reject when an error occurs
        if ('error' in data) {
          logger.debug('Error in authorize response', response);
          return {
            error: {
              status: 400,
              statusText: 'AUTHORIZE_ERROR',
              data: {
                error: data.error || 'Unknown_Error',
                error_description:
                  data.error_description || 'An unknown error occurred during authorization',
                type: 'auth_error',
              },
            },
          };
        }

        return { data: response.data } as { data: AuthorizationSuccess };
      },
    }),
    endSession: builder.mutation<null, { idToken: string; endpoint: string }>({
      queryFn: async ({ idToken, endpoint }, api, _, baseQuery) => {
        const { requestMiddleware, logger } = api.extra as Extras;

        const url = new URL(endpoint);
        url.searchParams.append('id_token_hint', idToken);

        const request: FetchArgs = {
          url: url.toString(),
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        };

        logger.debug('OIDC endSession API request', request);

        const response = await initQuery(request, 'endSession')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        if (response.error) {
          let message = 'An error occurred while trying to end the session';

          if (response.error.status === 400) {
            message = 'Bad request to end session endpoint';
          } else if (response.error.status === 401) {
            message = 'Unauthorized request to end session endpoint';
          } else if (response.error.status === 403) {
            message = 'Forbidden request to end session endpoint';
          }

          logger.error('End Session API error', message);

          response.error.data = transformError('End Session Error', message, response.error.status);
          return response;
        }

        logger.debug('OIDC endSession API response', response);

        return response as { data: null };
      },
    }),
    exchange: builder.mutation<
      TokenExchangeResponse,
      {
        code: string;
        config: OidcConfig;
        endpoint: string;
        verifier?: string;
      }
    >({
      queryFn: async ({ code, config, endpoint, verifier }, api, _, baseQuery) => {
        const { requestMiddleware, logger } = api.extra as Extras;

        const { clientId, redirectUri } = config;
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          redirect_uri: redirectUri,
        });

        if (verifier) {
          body.append('code_verifier', verifier);
        }

        const request = {
          url: endpoint,
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        };

        logger.debug('OIDC tokenExchange API request', request);

        const response = await initQuery(request, 'tokenExchange')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        if (response.error) {
          let message = 'An error occurred while exchanging the authorization code';

          if (response.error.status === 400) {
            message = 'Bad request to token exchange endpoint';
          } else if (response.error.status === 401) {
            message = 'Unauthorized request to token exchange endpoint';
          } else if (response.error.status === 403) {
            message = 'Forbidden request to token exchange endpoint';
          }

          logger.error('Token Exchange API error', message);

          response.error.data = transformError(
            'Token Exchange Error',
            message,
            response.error.status,
          );

          return response;
        }

        logger.debug('OIDC tokenExchange API response', response);

        return response as { data: TokenExchangeResponse };
      },
    }),
    revoke: builder.mutation<object, { accessToken: string; clientId?: string; endpoint: string }>({
      queryFn: async ({ accessToken, clientId, endpoint }, api, _, baseQuery) => {
        const { requestMiddleware, logger } = api.extra as Extras;

        const body = new URLSearchParams({
          ...(clientId ? { client_id: clientId } : {}),
          token: accessToken,
        });
        const request: FetchArgs = {
          url: endpoint,
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        };

        logger.debug('OIDC revoke API request', request);

        const response = await initQuery(request, 'revoke')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        if (response.error) {
          let message = 'An error occurred while revoking the token';

          if (response.error.status === 400) {
            message = 'Bad request to revoke endpoint';
          } else if (response.error.status === 401) {
            message = 'Unauthorized request to revoke endpoint';
          } else if (response.error.status === 403) {
            message = 'Forbidden request to revoke endpoint';
          }

          logger.error('Token Revoke API error', message);

          response.error.data = transformError(
            'Token Revoke Error',
            message,
            response.error.status,
          );
          return response;
        }

        logger.debug('OIDC revoke API response', response);

        return response as { data: object };
      },
    }),
    userInfo: builder.mutation<UserInfoResponse, { accessToken: string; endpoint: string }>({
      queryFn: async ({ accessToken, endpoint }, api, _, baseQuery) => {
        const { requestMiddleware, logger } = api.extra as Extras;

        const request: FetchArgs = {
          url: endpoint,
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        };

        logger.debug('OIDC userInfo API request', request);

        const response = await initQuery(request, 'userInfo')
          .applyMiddleware(requestMiddleware)
          .applyQuery(async (req: FetchArgs) => await baseQuery(req));

        let message = 'An error occurred while fetching user info';

        if (response.error) {
          if (response.error.status === 400) {
            message = 'Bad request to user info endpoint';
          } else if (response.error.status === 401) {
            message = 'Unauthorized request to user info endpoint';
          } else if (response.error.status === 403) {
            message = 'Forbidden request to user info endpoint';
          }

          logger.error('User Info API error', message);

          response.error.data = transformError('User Info Error', message, response.error.status);
          return response;
        }

        logger.debug('OIDC userInfo API response', response);

        return response as { data: UserInfoResponse };
      },
    }),
  }),
});
