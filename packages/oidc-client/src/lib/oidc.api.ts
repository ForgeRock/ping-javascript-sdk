import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { OidcConfig } from './config.types.js';
import { TokenExchangeResponse } from './exchange.types.js';

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
      transformResponse: (res) => {
        if (res && typeof res === 'object') {
          return null; // Successful logout, no content expected
        }
        throw new Error('Invalid response from end session endpoint');
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
      transformResponse: (res) => {
        if (!res || typeof res !== 'object') {
          throw new Error('Invalid response from token exchange');
        }
        if ('access_token' in res) {
          return res as TokenExchangeResponse;
        }
        throw new Error('Token exchange response does not contain access_token');
      },
    }),
    revoke: builder.mutation<null, { accessToken: string; clientId?: string; endpoint: string }>({
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
      transformResponse: (res) => {
        if (res && typeof res === 'object') {
          return null; // Successful revoke, no content expected
        }
        throw new Error('Invalid response from token revoke endpoint');
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
      transformResponse: (res) => {
        if (!res || typeof res !== 'object') {
          throw new Error('Invalid response from userinfo endpoint');
        }
        return res as TokenExchangeResponse;
      },
    }),
  }),
});
