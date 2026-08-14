/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { combineSlices } from '@reduxjs/toolkit';

import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { wellknownApi } from '@forgerock/sdk-store';

import type { ErrorNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

/**
 * The canonical description of the state this client contributes.
 *
 * Isolated into its own module to prevent a circular dependency:
 * `node.reducer.ts` → `client.store.utils.ts` → `node.slice.ts` would cycle.
 * Nothing that `node.reducer.ts` imports should import from this file.
 */
export const rootReducer = combineSlices(configSlice, nodeSlice, davinciApi, wellknownApi);

export type RootState = ReturnType<typeof rootReducer>;

export interface RootStateWithNode<
  T extends ErrorNode | ContinueNode | StartNode | SuccessNode,
> extends RootState {
  node: T;
}
