/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from './client.types.js';

/**
 * Re-export the shared wellknown RTK Query API from @forgerock/sdk-oidc.
 *
 * The wellknown API provides OIDC endpoint discovery functionality via
 * the `.well-known/openid-configuration` endpoint.
 */
export { wellknownApi, createWellknownSelector } from '@forgerock/sdk-oidc';

// Import locally for use in selector below
import { wellknownApi } from '@forgerock/sdk-oidc';

/**
 * Selector to retrieve the cached well-known response from Redux state.
 *
 * This is a convenience function that wraps the shared createWellknownSelector
 * for easier use with oidc-client's RootState type.
 *
 * @param wellknownUrl - The well-known endpoint URL used as the cache key
 * @param state - The Redux root state
 * @returns The cached WellKnownResponse or undefined if not yet fetched
 */
export function wellknownSelector(wellknownUrl: string, state: RootState) {
  const selector = createSelector(
    wellknownApi.endpoints.configuration.select(wellknownUrl),
    (result) => result?.data,
  );
  return selector(state);
}
