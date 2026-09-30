/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { WellknownResponse } from '@forgerock/sdk-types';
import type { DaVinciConfig } from '@forgerock/sdk-types';
import type { Endpoints } from './wellknown.types.js';

export type { DaVinciConfig };

export interface InternalDaVinciConfig extends DaVinciConfig {
  wellknownResponse: WellknownResponse;
}

/**
 * State shape of the configuration slice
 */
export interface ConfigState {
  endpoints: Endpoints;
  clientId: string;
  /**
   * Optional: when not configured, it stays undefined and
   * is omitted from the authorize request
   */
  redirectUri?: string;
  responseType: string;
  scope: string;
}
