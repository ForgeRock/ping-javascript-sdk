/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import {
  hasWellknownConfig,
  inferRealmFromIssuer,
  isValidWellknownUrl,
} from './wellknown.utils.js';
import type {
  JourneyConfigInput,
  AsyncJourneyClientConfig,
  JourneyClientConfig,
} from './config.types.js';

describe('wellknown.utils', () => {
  describe('hasWellknownConfig', () => {
    describe('hasWellknownConfig_ConfigWithWellknown_ReturnsTrue', () => {
      it('should return true when wellknown is present and non-empty', () => {
        // Arrange
        const config: AsyncJourneyClientConfig = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
            wellknown:
              'https://am.example.com/am/oauth2/realms/root/.well-known/openid-configuration',
          },
        };

        // Act
        const result = hasWellknownConfig(config);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('hasWellknownConfig_ConfigWithoutWellknown_ReturnsFalse', () => {
      it('should return false when wellknown is not present', () => {
        // Arrange
        const config: JourneyClientConfig = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
          },
        };

        // Act
        const result = hasWellknownConfig(config);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('hasWellknownConfig_EmptyWellknown_ReturnsFalse', () => {
      it('should return false when wellknown is an empty string', () => {
        // Arrange
        const config: JourneyConfigInput = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
            wellknown: '',
          },
        } as AsyncJourneyClientConfig;

        // Act
        const result = hasWellknownConfig(config);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('hasWellknownConfig_NoServerConfig_ReturnsFalse', () => {
      it('should return false when serverConfig is undefined', () => {
        // Arrange
        const config: JourneyConfigInput = {} as JourneyClientConfig;

        // Act
        const result = hasWellknownConfig(config);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('hasWellknownConfig_TypeNarrowing_AllowsAccessToWellknown', () => {
      it('should allow TypeScript to access wellknown after type guard', () => {
        // Arrange
        const config: JourneyConfigInput = {
          serverConfig: {
            baseUrl: 'https://am.example.com/am/',
            wellknown: 'https://am.example.com/.well-known/openid-configuration',
          },
        } as AsyncJourneyClientConfig;

        // Act & Assert
        if (hasWellknownConfig(config)) {
          // TypeScript should allow this access after the type guard
          expect(config.serverConfig.wellknown).toBe(
            'https://am.example.com/.well-known/openid-configuration',
          );
        } else {
          // This should not be reached
          expect.fail('Type guard should have returned true');
        }
      });
    });
  });

  describe('inferRealmFromIssuer', () => {
    describe('inferRealmFromIssuer_SubrealmIssuer_ReturnsSubrealm', () => {
      it('should extract subrealm from standard AM issuer URL', () => {
        // Arrange
        const issuer = 'https://am.example.com/am/oauth2/realms/root/realms/alpha';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_NestedSubrealm_ReturnsFullPath', () => {
      it('should extract nested subrealm path', () => {
        // Arrange
        const issuer =
          'https://am.example.com/am/oauth2/realms/root/realms/customers/realms/premium';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBe('customers/realms/premium');
      });
    });

    describe('inferRealmFromIssuer_RootRealmOnly_ReturnsRoot', () => {
      it('should return "root" for root realm issuer', () => {
        // Arrange
        const issuer = 'https://am.example.com/am/oauth2/realms/root';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBe('root');
      });
    });

    describe('inferRealmFromIssuer_NonAmIssuer_ReturnsUndefined', () => {
      it('should return undefined for non-AM issuer (PingOne)', () => {
        // Arrange
        const issuer = 'https://auth.pingone.com/env-id/as';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_GenericOidcIssuer_ReturnsUndefined', () => {
      it('should return undefined for generic OIDC issuer', () => {
        // Arrange
        const issuer = 'https://accounts.google.com';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_InvalidUrl_ReturnsUndefined', () => {
      it('should return undefined for invalid URL', () => {
        // Arrange
        const issuer = 'not-a-valid-url';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_IssuerWithPort_ReturnsRealm', () => {
      it('should correctly parse issuer with port number', () => {
        // Arrange
        const issuer = 'https://am.example.com:8443/am/oauth2/realms/root/realms/test';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        expect(result).toBe('test');
      });
    });

    describe('inferRealmFromIssuer_IssuerWithQueryParams_ReturnsRealm', () => {
      it('should correctly parse issuer even with query parameters (edge case)', () => {
        // Arrange - Note: well-formed issuer URLs shouldn't have query params,
        // but we should handle this gracefully
        const issuer = 'https://am.example.com/am/oauth2/realms/root/realms/alpha?extra=param';

        // Act
        const result = inferRealmFromIssuer(issuer);

        // Assert
        // The regex matches the pathname, so query params don't interfere
        expect(result).toBe('alpha');
      });
    });
  });

  describe('isValidWellknownUrl', () => {
    describe('isValidWellknownUrl_HttpsUrl_ReturnsTrue', () => {
      it('should return true for HTTPS URL', () => {
        // Arrange
        const url = 'https://am.example.com/.well-known/openid-configuration';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('isValidWellknownUrl_HttpLocalhost_ReturnsTrue', () => {
      it('should return true for HTTP localhost', () => {
        // Arrange
        const url = 'http://localhost:8080/.well-known/openid-configuration';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('isValidWellknownUrl_Http127001_ReturnsTrue', () => {
      it('should return true for HTTP 127.0.0.1', () => {
        // Arrange
        const url = 'http://127.0.0.1:8080/.well-known/openid-configuration';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('isValidWellknownUrl_HttpNonLocalhost_ReturnsFalse', () => {
      it('should return false for HTTP non-localhost URL', () => {
        // Arrange
        const url = 'http://am.example.com/.well-known/openid-configuration';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownUrl_InvalidUrl_ReturnsFalse', () => {
      it('should return false for invalid URL', () => {
        // Arrange
        const url = 'not-a-valid-url';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownUrl_EmptyString_ReturnsFalse', () => {
      it('should return false for empty string', () => {
        // Arrange
        const url = '';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownUrl_FtpProtocol_ReturnsFalse', () => {
      it('should return false for non-HTTP protocols', () => {
        // Arrange
        const url = 'ftp://am.example.com/.well-known/openid-configuration';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownUrl_HttpsLocalhost_ReturnsTrue', () => {
      it('should return true for HTTPS localhost', () => {
        // Arrange
        const url = 'https://localhost:8443/.well-known/openid-configuration';

        // Act
        const result = isValidWellknownUrl(url);

        // Assert
        expect(result).toBe(true);
      });
    });
  });
});
