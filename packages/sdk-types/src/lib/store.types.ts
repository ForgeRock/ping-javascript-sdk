/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Opaque handle to a shared SDK Redux store.
 *
 * Consumers can pass this between SDK client factories but cannot access
 * Redux internals (dispatch, getState, etc.) through this type — by design.
 */
export interface SdkStore {
  readonly __sdkStoreBrand: symbol;
}
