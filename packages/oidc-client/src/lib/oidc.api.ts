import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { OidcConfig } from './config.types.js';
import { TokenExchangeResponse } from './token.types.js';

export const oidcApi = createApi({
  reducerPath: 'oidc',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
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
    }),
  }),
});
