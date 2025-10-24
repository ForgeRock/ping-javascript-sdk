/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { JourneyClientConfig } from '@forgerock/journey-client/types';

export const serverConfigs: Record<string, JourneyClientConfig> = {
  basic: {
    serverConfig: {
      baseUrl: 'https://openam-sdks.forgeblocks.com/am/',
    },
    realmPath: '/alpha',
  },
};
