/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { WellknownResponse } from './wellknown.types.js';

export const wellknownApi = createApi({
  reducerPath: 'wellknown',
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    wellknown: builder.query<WellknownResponse, string>({
      query: (endpoint: string) => ({ url: endpoint }),
    }),
  }),
});
