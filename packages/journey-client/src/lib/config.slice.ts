/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WellknownResponse } from '@forgerock/sdk-types';
import type { InternalJourneyClientConfig } from './config.types.js';
import { convertWellknown } from './wellknown.utils.js';

/**
 * Payload dispatched to the config slice after well-known resolution.
 * Carries the raw well-known response so the slice owns the conversion
 * to internal server config via {@link convertWellknown}.
 */
export interface ResolvedConfig {
  type: 'wellknown';
  wellknownResponse: WellknownResponse;
}

interface BaseConfig {
  type: 'baseUrl';
  baseUrl: string;
  paths: {
    authenticate: string;
    sessions: string;
  };
}

const initialState: InternalJourneyClientConfig = {
  serverConfig: { baseUrl: '', paths: { authenticate: '', sessions: '' } },
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
    set(state, action: PayloadAction<ResolvedConfig | BaseConfig>) {
      if (action.payload.type === 'baseUrl') {
        const { baseUrl, paths } = action.payload;
        state.serverConfig = { baseUrl, paths };
      } else {
        const config = convertWellknown(action.payload.wellknownResponse);
        if ('error' in config) {
          state.error = config;
        } else {
          state.serverConfig = config;
          state.error = undefined;
        }
      }
    },
  },
});
