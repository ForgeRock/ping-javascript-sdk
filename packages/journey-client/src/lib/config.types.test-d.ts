/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  JourneyClientConfig,
  JourneyServerConfig,
  InternalJourneyClientConfig,
} from './config.types.js';
import type { AsyncLegacyConfigOptions } from '@forgerock/sdk-types';
import type { ResolvedServerConfig } from './wellknown.utils.js';

describe('Config Types', () => {
  describe('JourneyClientConfig', () => {
    it('should extend AsyncLegacyConfigOptions', () => {
      expectTypeOf<JourneyClientConfig>().toExtend<AsyncLegacyConfigOptions>();
    });

    it('should narrow serverConfig to JourneyServerConfig', () => {
      expectTypeOf<JourneyClientConfig['serverConfig']>().toExtend<JourneyServerConfig>();
      expectTypeOf<JourneyClientConfig['serverConfig']['wellknown']>().toBeString();
    });

    it('should reject config without wellknown', () => {
      // @ts-expect-error - wellknown is required on serverConfig
      const config: JourneyClientConfig = { serverConfig: {} };
      // This assertion verifies the variable's runtime shape doesn't satisfy the full type.
      expectTypeOf(config).not.toMatchObjectType<Required<JourneyClientConfig>>();
    });

    it('should allow AsyncLegacyConfigOptions properties', () => {
      const config: JourneyClientConfig = {
        clientId: 'test-client',
        scope: 'openid profile',
        redirectUri: 'https://app.example.com/callback',
        serverConfig: {
          wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
          timeout: 30000,
        },
      };
      expectTypeOf(config).toExtend<JourneyClientConfig>();
    });

    it('should not require inherited properties like clientId', () => {
      const config: JourneyClientConfig = {
        serverConfig: {
          wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
        },
      };
      expectTypeOf(config).toExtend<JourneyClientConfig>();
    });

    it('should have optional timeout on serverConfig', () => {
      expectTypeOf<JourneyClientConfig['serverConfig']>().toHaveProperty('timeout');
    });
  });

  describe('InternalJourneyClientConfig', () => {
    it('should have ResolvedServerConfig', () => {
      expectTypeOf<InternalJourneyClientConfig>()
        .toHaveProperty('serverConfig')
        .toExtend<ResolvedServerConfig>();
    });

    it('should have optional error', () => {
      expectTypeOf<InternalJourneyClientConfig>().toHaveProperty('error').toBeNullable();
    });
  });
});
