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
 * Both baseUrl and realmPath are automatically inferred from the wellknown URL:
 * - baseUrl: extracted from the path before `/oauth2/`
 * - realmPath: extracted from the issuer URL in the wellknown response
 */
export const serverConfigs: Record<string, JourneyClientConfig> = {
  basic: {
    serverConfig: {
      wellknown: 'http://localhost:9443/am/oauth2/realms/root/.well-known/openid-configuration',
      // baseUrl inferred: http://localhost:9443/am/
      // realmPath inferred from issuer: 'root'
    },
  },
  tenant: {
    serverConfig: {
      wellknown:
        'https://openam-sdks.forgeblocks.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
      // baseUrl inferred: https://openam-sdks.forgeblocks.com/am/
      // realmPath inferred from issuer: 'alpha'
    },
  },
};
