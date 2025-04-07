/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { configureStore } from '@reduxjs/toolkit';

import type { RequestMiddleware } from '@forgerock/effects/types';
import { configSlice } from './config.slice.js';
import { nodeSlice } from './node.slice.js';
import { davinciApi } from './davinci.api.js';
import { ErrorNode, ContinueNode, StartNode, SuccessNode } from '../types.js';
import { wellknownApi } from './wellknown.api.js';
import { ActionTypes } from '@forgerock/effects/unions';

export function createClientStore<ActionType extends ActionTypes>({
  requestMiddleware,
}: {
  requestMiddleware?: RequestMiddleware<ActionType, unknown>[];
}) {
  return configureStore({
    reducer: {
      config: configSlice.reducer,
      node: nodeSlice.reducer,
      [davinciApi.reducerPath]: davinciApi.reducer,
      [wellknownApi.reducerPath]: wellknownApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            /**
             * This becomes the `api.extra` argument, and will be passed into the
             * customer query wrapper for `baseQuery`
             */
            requestMiddleware: requestMiddleware,
          },
        },
      })
        .concat(davinciApi.middleware)
        .concat(wellknownApi.middleware),
  });
}

type ClientStore = typeof createClientStore;

export type RootState = ReturnType<ReturnType<ClientStore>['getState']>;

export interface RootStateWithNode<T extends ErrorNode | ContinueNode | StartNode | SuccessNode>
  extends RootState {
  node: T;
}

export type AppDispatch = ReturnType<ReturnType<ClientStore>['dispatch']>;
