/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { JourneyClientConfig } from '@forgerock/journey-client/types';

/**
 * Server configurations for E2E tests.
 *
 * All configuration (baseUrl, authenticate/sessions paths) is automatically
 * derived from the well-known response via `convertWellknown()`.
 */
export const serverConfigs: Record<string, JourneyClientConfig> = {
  basic: {
    serverConfig: {
      wellknown: 'http://localhost:9443/am/oauth2/realms/root/.well-known/openid-configuration',
    },
  },
  tenant: {
    serverConfig: {
      wellknown:
        'https://openam-sdks.forgeblocks.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
    },
  },
};
