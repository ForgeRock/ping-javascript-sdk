/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { wellknownApi } from '@forgerock/sdk-store';
import { combineSlices } from '@reduxjs/toolkit';

import { configSlice } from './config.slice.js';
import { journeyApi } from './journey.api.js';

/**
 * The canonical description of the state this client contributes.
 *
 * The runtime store is assembled by `injectClient`, which TypeScript cannot
 * follow across lazy injection. Combining the same slices here lets the state
 * type be *derived* from them rather than hand-written, so it cannot drift from
 * what is actually mounted. Exported so the derived state type resolves for
 * consumers, and so an application can compose the reducer itself if it wants.
 */
export const rootReducer = combineSlices(journeyApi, configSlice, wellknownApi);

export type RootState = ReturnType<typeof rootReducer>;
