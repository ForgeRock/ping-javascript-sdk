/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

import type { WellKnownResponse } from '@forgerock/sdk-types';
import type { RootState } from './client.types.js';

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
