import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import { WellKnownResponse } from '@forgerock/sdk-types';

import type { RootState } from './client.store.utils.js';

export const wellknownApi = createApi({
  reducerPath: 'wellknown',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    configuration: builder.query<WellKnownResponse, string>({
      query: (endpoint) => `${endpoint}`,
    }),
  }),
});

export function wellknownSelector(wellknownUrl: string, state: RootState) {
  const selector = createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
  return selector(state);
}
