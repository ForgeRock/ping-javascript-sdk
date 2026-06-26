/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { WellknownResponse } from '@forgerock/sdk-types';
import type { DaVinciConfig } from '@forgerock/sdk-types';

export type { DaVinciConfig };

export interface InternalDaVinciConfig extends DaVinciConfig {
  wellknownResponse: WellknownResponse;
}
