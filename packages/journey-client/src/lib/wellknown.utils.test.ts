/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { hasWellknownConfig } from './wellknown.utils.js';
import type {
  JourneyConfigInput,
  AsyncJourneyClientConfig,
  JourneyClientConfig,
} from './config.types.js';

/**
 * Tests for journey-client specific wellknown utilities.
 *
 * Note: Tests for createWellknownError, inferRealmFromIssuer, and isValidWellknownUrl
 * are in @forgerock/sdk-oidc and @forgerock/sdk-utilities respectively,
 * as those are shared utilities.
 */
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
});
