/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

const authorizeSlice = createApi({
  reducerPath: 'authorizeSlice',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      headers.set('x-requested-with', 'ping-sdk');
      headers.set('x-requested-platform', 'javascript');

      return headers;
    },
  }),
  endpoints: (builder) => ({
    handleAuthorize: builder.query<string, string>({
      query: (authorizeUrl) => authorizeUrl,
    }),
  }),
});

export { authorizeSlice };
