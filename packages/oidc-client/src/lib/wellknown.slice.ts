import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

// Define the shape of the wellknown config
// Matches DaVinci client wellknown config shape
export interface WellknownConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  response_types_supported?: string[];
  scopes_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  claims_supported?: string[];
  [key: string]: any;
}

export const fetchWellKnownConfig = createApi({
  reducerPath: 'fetchWellKnown',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    fetchWellKnownConfig: builder.query<WellknownConfig, string>({
      query: (endpoint) => `${endpoint}`,
    }),
  }),
});
