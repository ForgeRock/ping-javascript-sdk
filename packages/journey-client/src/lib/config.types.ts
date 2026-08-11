/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenericError } from '@forgerock/sdk-types';
import type { ResolvedServerConfig } from './wellknown.utils.js';

export type { JourneyServerConfig, JourneyClientConfig } from '@forgerock/sdk-types';

/**
 * Internal configuration after wellknown discovery and path resolution.
 * Used internally by the journey client — not part of the public API.
 *
 * @internal
 */
export interface InternalJourneyClientConfig {
  serverConfig: ResolvedServerConfig;
  error?: GenericError;
}
