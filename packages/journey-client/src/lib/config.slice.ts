/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the createSlice and PayloadAction utilities from Redux Toolkit
 * @see https://redux-toolkit.js.org/api/createslice
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Import the types
 */
import type { InternalJourneyClientConfig, JourneyClientConfig } from './config.types.js';
import type { WellknownResponse } from '@forgerock/sdk-types';
import { convertWellknown } from './wellknown.utils.js';

interface ConfigWithWellknown extends JourneyClientConfig {
  wellknownResponse: WellknownResponse;
}

/**
 * @const initialState - The initial state of the configuration slice
 * NOTE: The clientId, redirectUri, responseType, and scope are set to empty strings
 */
const initialState: InternalJourneyClientConfig = {
  serverConfig: {
    baseUrl: '',
    paths: {},
  },
  middleware: [],
};

/**
 * @const configSlice - Define the configuration slice for Redux state management
 * @see https://redux-toolkit.js.org/api/createslice
 */
export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducerPath: 'config',
  reducers: {
    /**
     * @method set - Set the configuration for the DaVinci client
     * @param {Object} state - The current state of the slice
     * @param {PayloadAction<ConfigWithWellknown>} action - The action to be dispatched
     * @returns {void}
     */
    set(state, action: PayloadAction<ConfigWithWellknown>) {
      state.serverConfig = convertWellknown(action.payload.wellknownResponse);
      state.middleware = action.payload.middleware;
    },
  },
});
