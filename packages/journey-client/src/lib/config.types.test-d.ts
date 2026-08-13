/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  JourneyClientConfig,
  JourneyServerConfig,
  LegacyServerConfig,
  InternalJourneyClientConfig,
} from './config.types.js';
import type { AsyncLegacyConfigOptions } from '@forgerock/sdk-types';
import type { ResolvedServerConfig } from './wellknown.utils.js';

describe('Config Types', () => {
  describe('JourneyClientConfig', () => {
    it('should extend AsyncLegacyConfigOptions', () => {
      expectTypeOf<JourneyClientConfig>().toExtend<AsyncLegacyConfigOptions>();
    });

    it('should type serverConfig as JourneyServerConfig | LegacyServerConfig', () => {
      expectTypeOf<JourneyClientConfig['serverConfig']>().toEqualTypeOf<
        JourneyServerConfig | LegacyServerConfig
      >();
    });

    it('should have wellknown only on the JourneyServerConfig branch', () => {
      type WellknownBranch = Extract<JourneyClientConfig['serverConfig'], { wellknown: string }>;
      expectTypeOf<WellknownBranch['wellknown']>().toBeString();
    });

    it('should reject serverConfig with neither wellknown nor baseUrl', () => {
      // @ts-expect-error - serverConfig must satisfy JourneyServerConfig (wellknown) or LegacyServerConfig (baseUrl)
      const config: JourneyClientConfig = { serverConfig: {} };
      expectTypeOf(config).not.toMatchObjectType<Required<JourneyClientConfig>>();
    });

    it('should accept LegacyServerConfig with baseUrl', () => {
      const config: JourneyClientConfig = {
        serverConfig: { baseUrl: 'https://am.example.com' },
      };
      expectTypeOf(config).toExtend<JourneyClientConfig>();
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

    it('should have optional timeout on both serverConfig branches', () => {
      expectTypeOf<JourneyServerConfig>().toHaveProperty('timeout');
      expectTypeOf<LegacyServerConfig>().toHaveProperty('timeout');
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
