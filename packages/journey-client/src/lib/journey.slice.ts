/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import type { Step } from '@forgerock/sdk-types';
import type { JourneyClientConfig } from './config.types.js';

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
  reducers: {
    setConfig: (state, action: PayloadAction<JourneyClientConfig>) => {
      state.config = action.payload;
    },
  },
});

export const { setConfig } = journeySlice.actions;
