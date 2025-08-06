import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { OidcConfig } from './config.types.js';
import { TokenExchangeResponse } from './exchange.types.js';
import { transformError } from './oidc.api.utils.js';

export const oidcApi = createApi({
  reducerPath: 'oidc',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    endSession: builder.mutation<null, { idToken: string; endpoint: string }>({
      query: ({ idToken, endpoint }) => {
        // append the id_token_hint to the end session endpoint
        const url = new URL(endpoint);
        url.searchParams.append('id_token_hint', idToken);

        return {
          url: url.toString(),
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        };
      },
      transformErrorResponse: (error) => {
        let message = 'An error occurred while trying to end the session';

        if (error.status === 400) {
          message = 'Bad request to end session endpoint';
        } else if (error.status === 401) {
          message = 'Unauthorized request to end session endpoint';
        } else if (error.status === 403) {
          message = 'Forbidden request to end session endpoint';
        }

        return transformError('End Session Error', message, error.status);
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
      query: ({ code, config, endpoint, verifier }) => {
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

        return {
          url: endpoint,
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        };
      },
      transformErrorResponse: (error) => {
        let message = 'An error occurred while exchanging the authorization code';

        if (error.status === 400) {
          message = 'Bad request to token exchange endpoint';
        } else if (error.status === 401) {
          message = 'Unauthorized request to token exchange endpoint';
        } else if (error.status === 403) {
          message = 'Forbidden request to token exchange endpoint';
        }

        return transformError('Token Exchange Error', message, error.status);
      },
    }),
    revoke: builder.mutation<object, { accessToken: string; clientId?: string; endpoint: string }>({
      query: ({ accessToken, clientId, endpoint }) => {
        const body = new URLSearchParams({
          ...(clientId ? { client_id: clientId } : {}),
          token: accessToken,
        });
        return {
          url: endpoint,
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        };
      },
      transformErrorResponse: (error) => {
        let message = 'An error occurred while revoking the token';

        if (error.status === 400) {
          message = 'Bad request to revoke endpoint';
        } else if (error.status === 401) {
          message = 'Unauthorized request to revoke endpoint';
        } else if (error.status === 403) {
          message = 'Forbidden request to revoke endpoint';
        }

        return transformError('Token Revoke Error', message, error.status);
      },
    }),
    userInfo: builder.mutation<TokenExchangeResponse, { accessToken: string; endpoint: string }>({
      query: ({ accessToken, endpoint }) => {
        return {
          url: endpoint,
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        };
      },
      transformErrorResponse: (error) => {
        let message = 'An error occurred while fetching user info';

        if (error.status === 400) {
          message = 'Bad request to user info endpoint';
        } else if (error.status === 401) {
          message = 'Unauthorized request to user info endpoint';
        } else if (error.status === 403) {
          message = 'Forbidden request to user info endpoint';
        }

        return transformError('User Info Error', message, error.status);
      },
    }),
  }),
});
