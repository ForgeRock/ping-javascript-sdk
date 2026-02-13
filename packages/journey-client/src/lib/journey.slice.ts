/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSlice, Slice } from '@reduxjs/toolkit';

import type { Step } from '@forgerock/sdk-types';
import { JourneyClientConfig } from './config.types.js';

/**
 * Redux state for the journey client.
 *
 * Contains the current authentication state including:
 * - authId: The authentication session identifier
 * - step: The current authentication step
 * - error: Any error that occurred during authentication
 * - config: The resolved client configuration (including well-known response if used)
 */
export interface JourneyState {
  authId?: string;
  step?: Step;
  error?: Error;
  config?: JourneyClientConfig;
}

const initialState: JourneyState = {};

export const journeySlice: Slice<JourneyState> = createSlice({
  name: 'journey',
  initialState,
  reducers: {},
});

export const { setConfig } = journeySlice.actions;
