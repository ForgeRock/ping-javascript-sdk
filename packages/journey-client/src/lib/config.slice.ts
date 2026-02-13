/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { WellknownResponse } from '@forgerock/sdk-types';
import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';

import type { InternalJourneyClientConfig } from './config.types.js';
import { convertWellknown } from './wellknown.utils.js';

/**
 * Payload dispatched to the config slice after well-known resolution.
 * Carries the raw well-known response so the slice owns the conversion
 * to internal server config via {@link convertWellknown}.
 */
export interface ResolvedConfig {
  wellknownResponse: WellknownResponse;
  middleware?: Array<RequestMiddleware>;
}

const initialState: InternalJourneyClientConfig = {
  serverConfig: { baseUrl: '', paths: { authenticate: '', sessions: '' } },
  middleware: [],
};

/**
 * Redux slice for journey client configuration.
 *
 * Separated from the journey auth state slice (which holds authId, step, error)
 * so that configuration concerns don't mix with authentication flow state.
 * The `set` action converts the raw well-known response via `convertWellknown()`
 * and stores the resulting `ResolvedServerConfig`.
 */
export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    set(state, action: PayloadAction<ResolvedConfig>) {
      const wellknown = convertWellknown(action.payload.wellknownResponse);
      if ('error' in wellknown) {
        state.error = wellknown;
      } else {
        state.serverConfig = wellknown;
        state.error = undefined;
      }
      state.middleware = action.payload.middleware;
    },
  },
});
