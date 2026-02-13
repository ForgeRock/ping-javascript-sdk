/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { AsyncLegacyConfigOptions, WellknownResponse } from '@forgerock/sdk-types';

export interface DaVinciConfig extends AsyncLegacyConfigOptions {
  responseType?: string;
}

export interface InternalDaVinciConfig extends DaVinciConfig {
  wellknownResponse: WellknownResponse;
}
