/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export { wellknownApi, wellknownSelector, createWellknownSelector } from './lib/wellknown.api.js';
export type { WellknownState } from './lib/wellknown.api.js';

export { initWellknownQuery, isValidWellknownResponse } from './lib/wellknown.effects.js';

export { clientExtra } from './lib/store.utils.js';

export { createSdkStore, injectClient, isSdkStoreHandle } from './lib/store.effects.js';
export type {
  ClientSlot,
  InjectClientOptions,
  SdkStore,
  SdkStoreHandle,
  SdkStoreRegistry,
} from './lib/store.types.js';
