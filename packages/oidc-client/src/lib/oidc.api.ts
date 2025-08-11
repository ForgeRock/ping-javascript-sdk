import { createApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { OidcConfig } from './config.types.js';
import { transformError } from './oidc.api.utils.js';

import type { logger as loggerFn } from '@forgerock/sdk-logger';
import {
  initQuery,
  type ActionTypes,
  type RequestMiddleware,
} from '@forgerock/sdk-request-middleware';

import type { TokenExchangeResponse } from './exchange.types.js';

interface Extras<ActionType extends ActionTypes = ActionTypes, Payload = unknown> {
  requestMiddleware: RequestMiddleware<ActionType, Payload>[];
  logger: ReturnType<typeof loggerFn>;
}

export const oidcApi = createApi({
  reducerPath: 'oidc',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
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
    userInfo: builder.mutation<TokenExchangeResponse, { accessToken: string; endpoint: string }>({
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

        return response as { data: TokenExchangeResponse };
      },
    }),
  }),
});
