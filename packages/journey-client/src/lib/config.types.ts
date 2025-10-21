/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { BaseConfig } from '@forgerock/sdk-types';
import { RequestMiddleware } from '@forgerock/sdk-request-middleware';

export interface JourneyClientConfig extends BaseConfig {
  middleware?: Array<RequestMiddleware>;
  realmPath?: string;
  // Add any journey-specific config options here
}

export type { RequestMiddleware };
