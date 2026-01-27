/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { hasWellknownConfig, inferRealmFromIssuer } from './wellknown.utils.js';
import type {
  JourneyConfigInput,
  AsyncJourneyClientConfig,
  JourneyClientConfig,
} from './config.types.js';

describe('wellknown.utils', () => {
  describe('hasWellknownConfig', () => {
    describe('hasWellknownConfig_ConfigWithWellknown_ReturnsTrue', () => {
      it('should return true when wellknown is present and non-empty', () => {
        const config: AsyncJourneyClientConfig = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
            wellknown:
              'https://am.example.com/am/oauth2/realms/root/.well-known/openid-configuration',
          },
        };

        const result = hasWellknownConfig(config);

        expect(result).toBe(true);
      });
    });

    describe('hasWellknownConfig_ConfigWithoutWellknown_ReturnsFalse', () => {
      it('should return false when wellknown is not present', () => {
        const config: JourneyClientConfig = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
          },
        };

        const result = hasWellknownConfig(config);

        expect(result).toBe(false);
      });
    });

    describe('hasWellknownConfig_EmptyWellknown_ReturnsFalse', () => {
      it('should return false when wellknown is an empty string', () => {
        const config: JourneyConfigInput = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
            wellknown: '',
          },
        } as AsyncJourneyClientConfig;

        const result = hasWellknownConfig(config);

        expect(result).toBe(false);
      });
    });

    describe('hasWellknownConfig_NoServerConfig_ReturnsFalse', () => {
      it('should return false when serverConfig is undefined', () => {
        const config: JourneyConfigInput = {} as JourneyClientConfig;

        const result = hasWellknownConfig(config);

        expect(result).toBe(false);
      });
    });

    describe('hasWellknownConfig_TypeNarrowing_AllowsAccessToWellknown', () => {
      it('should allow TypeScript to access wellknown after type guard', () => {
        const config: JourneyConfigInput = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
            wellknown: 'https://am.example.com/.well-known/openid-configuration',
          },
        } as AsyncJourneyClientConfig;

        if (hasWellknownConfig(config)) {
          expect(config.serverConfig.wellknown).toBe(
            'https://am.example.com/.well-known/openid-configuration',
          );
        } else {
          expect.fail('Type guard should have returned true');
        }
      });
    });
  });

  describe('inferRealmFromIssuer', () => {
    describe('inferRealmFromIssuer_SimplifiedFormat_ReturnsRealm', () => {
      it('should extract realm from simplified AM issuer URL', () => {
        const issuer = 'https://openam-sdks.forgeblocks.com:443/am/oauth2/alpha';

        expect(inferRealmFromIssuer(issuer)).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_SimplifiedFormatNoPort_ReturnsRealm', () => {
      it('should extract realm from simplified AM issuer URL without port', () => {
        const issuer = 'https://am.example.com/am/oauth2/alpha';

        expect(inferRealmFromIssuer(issuer)).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_LegacySubrealmFormat_ReturnsRealm', () => {
      it('should extract subrealm from legacy AM issuer URL', () => {
        const issuer = 'https://am.example.com/am/oauth2/realms/root/realms/alpha';

        expect(inferRealmFromIssuer(issuer)).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_LegacyNestedSubrealm_ReturnsFullPath', () => {
      it('should extract nested subrealm path from legacy format', () => {
        const issuer =
          'https://am.example.com/am/oauth2/realms/root/realms/customers/realms/premium';

        expect(inferRealmFromIssuer(issuer)).toBe('customers/realms/premium');
      });
    });

    describe('inferRealmFromIssuer_LegacyRootRealm_ReturnsRoot', () => {
      it('should return "root" for legacy root realm issuer', () => {
        const issuer = 'https://am.example.com/am/oauth2/realms/root';

        expect(inferRealmFromIssuer(issuer)).toBe('root');
      });
    });

    describe('inferRealmFromIssuer_NonAmIssuer_ReturnsUndefined', () => {
      it('should return undefined for non-AM issuer (PingOne)', () => {
        const issuer = 'https://auth.pingone.com/env-id/as';

        expect(inferRealmFromIssuer(issuer)).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_GenericOidcIssuer_ReturnsUndefined', () => {
      it('should return undefined for generic OIDC issuer', () => {
        const issuer = 'https://accounts.google.com';

        expect(inferRealmFromIssuer(issuer)).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_InvalidUrl_ReturnsUndefined', () => {
      it('should return undefined for invalid URL', () => {
        expect(inferRealmFromIssuer('not-a-valid-url')).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_IssuerWithPort_ReturnsRealm', () => {
      it('should correctly parse issuer with port number (legacy format)', () => {
        const issuer = 'https://am.example.com:8443/am/oauth2/realms/root/realms/test';

        expect(inferRealmFromIssuer(issuer)).toBe('test');
      });
    });
  });
});
