/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { LegacyConfigOptions, StepOptions } from '@forgerock/sdk-types';

export interface JourneyClientConfig extends LegacyConfigOptions {
  query?: Record<string, string>;
  // Add any journey-specific config options here
}

export type { StepOptions };
