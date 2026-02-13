/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { convertWellknown } from './wellknown.utils.js';

import type { WellknownResponse } from '@forgerock/sdk-types';

function createMockWellknown(overrides: Partial<WellknownResponse> = {}): WellknownResponse {
  return {
    issuer: 'https://am.example.com/am/oauth2/alpha',
    authorization_endpoint: 'https://am.example.com/am/oauth2/alpha/authorize',
    token_endpoint: 'https://am.example.com/am/oauth2/alpha/access_token',
    userinfo_endpoint: 'https://am.example.com/am/oauth2/alpha/userinfo',
    end_session_endpoint: 'https://am.example.com/am/oauth2/alpha/connect/endSession',
    introspection_endpoint: 'https://am.example.com/am/oauth2/alpha/introspect',
    revocation_endpoint: 'https://am.example.com/am/oauth2/alpha/token/revoke',
    ...overrides,
  };
}

describe('wellknown.utils', () => {
  describe('convertWellknown', () => {
    describe('convertWellknown_SimplifiedAmFormat_ReturnsCorrectConfig', () => {
      it('should derive baseUrl and paths from a simplified AM well-known response', () => {
        // Arrange
        const data = createMockWellknown();

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('https://am.example.com');
        expect(result.paths.authenticate).toBe('/am/json/alpha/authenticate');
        expect(result.paths.sessions).toBe('/am/json/alpha/sessions/');
      });
    });

    describe('convertWellknown_LegacyRootRealm_ReturnsCorrectConfig', () => {
      it('should handle legacy root realm format', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'https://test.com/am/oauth2/realms/root',
          authorization_endpoint: 'https://test.com/am/oauth2/realms/root/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('https://test.com');
        expect(result.paths.authenticate).toBe('/am/json/realms/root/authenticate');
        expect(result.paths.sessions).toBe('/am/json/realms/root/sessions/');
      });
    });

    describe('convertWellknown_LegacySubrealm_ReturnsCorrectConfig', () => {
      it('should handle legacy subrealm format', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'https://test.com/am/oauth2/realms/root/realms/alpha',
          authorization_endpoint: 'https://test.com/am/oauth2/realms/root/realms/alpha/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('https://test.com');
        expect(result.paths.authenticate).toBe('/am/json/realms/root/realms/alpha/authenticate');
        expect(result.paths.sessions).toBe('/am/json/realms/root/realms/alpha/sessions/');
      });
    });

    describe('convertWellknown_NestedSubrealm_ReturnsCorrectConfig', () => {
      it('should handle deeply nested subrealm format', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'https://test.com/am/oauth2/realms/root/realms/customers/realms/premium',
          authorization_endpoint:
            'https://test.com/am/oauth2/realms/root/realms/customers/realms/premium/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('https://test.com');
        expect(result.paths.authenticate).toBe(
          '/am/json/realms/root/realms/customers/realms/premium/authenticate',
        );
        expect(result.paths.sessions).toBe(
          '/am/json/realms/root/realms/customers/realms/premium/sessions/',
        );
      });
    });

    describe('convertWellknown_IssuerWithPort_ReturnsCorrectBaseUrl', () => {
      it('should preserve non-standard port in baseUrl', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'https://am.example.com:8443/am/oauth2/alpha',
          authorization_endpoint: 'https://am.example.com:8443/am/oauth2/alpha/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('https://am.example.com:8443');
        expect(result.paths.authenticate).toBe('/am/json/alpha/authenticate');
      });
    });

    describe('convertWellknown_NoContextPath_ReturnsCorrectConfig', () => {
      it('should handle URLs without AM context path', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'https://am.example.com/oauth2/alpha',
          authorization_endpoint: 'https://am.example.com/oauth2/alpha/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('https://am.example.com');
        expect(result.paths.authenticate).toBe('/json/alpha/authenticate');
        expect(result.paths.sessions).toBe('/json/alpha/sessions/');
      });
    });

    describe('convertWellknown_NonAmIssuer_ReturnsGenericError', () => {
      it('should return a GenericError when issuer does not contain /oauth2/', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'https://auth.pingone.com/env-id/as',
          authorization_endpoint: 'https://auth.pingone.com/env-id/as/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result).toMatchObject({
          error: 'Well-known configuration conversion failed',
          message: expect.stringContaining('ForgeRock AM issuer'),
          type: 'wellknown_error',
        });
      });
    });

    describe('convertWellknown_MissingAuthEndpoint_ReturnsGenericError', () => {
      it('should return a GenericError when authorization_endpoint is missing', () => {
        // Arrange
        const data = createMockWellknown({
          authorization_endpoint: '',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result).toMatchObject({
          error: 'Well-known configuration conversion failed',
          message: expect.stringContaining('authorization_endpoint'),
          type: 'wellknown_error',
        });
      });
    });

    describe('convertWellknown_LocalhostDev_ReturnsCorrectConfig', () => {
      it('should handle localhost development URLs', () => {
        // Arrange
        const data = createMockWellknown({
          issuer: 'http://localhost:9443/am/oauth2/realms/root',
          authorization_endpoint: 'http://localhost:9443/am/oauth2/realms/root/authorize',
        });

        // Act
        const result = convertWellknown(data);

        // Assert
        expect(result.baseUrl).toBe('http://localhost:9443');
        expect(result.paths.authenticate).toBe('/am/json/realms/root/authenticate');
        expect(result.paths.sessions).toBe('/am/json/realms/root/sessions/');
      });
    });
  });
});
