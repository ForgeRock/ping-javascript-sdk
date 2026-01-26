/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { DaVinciConfig, InternalDaVinciConfig } from './config.types.js';
import type { AsyncLegacyConfigOptions, WellKnownResponse } from '@forgerock/sdk-types';

describe('Config Types', () => {
  describe('DaVinciConfig', () => {
    it('should extend AsyncLegacyConfigOptions', () => {
      expectTypeOf<DaVinciConfig>().toMatchTypeOf<AsyncLegacyConfigOptions>();
    });

    it('should have optional responseType', () => {
      const config: DaVinciConfig = {
        responseType: 'code',
        serverConfig: {},
      };
      expectTypeOf(typeof config['responseType']).toBeString();
      expectTypeOf<DaVinciConfig>().toHaveProperty('responseType').toBeNullable();
    });

    it('should allow AsyncLegacyConfigOptions properties', () => {
      const config: DaVinciConfig = {
        clientId: 'test-client',
        scope: 'openid profile',
        serverConfig: {
          wellknown: 'https://example.com',
          timeout: 30000,
        },
        redirectUri: 'https://app.example.com/callback',
        responseType: 'code',
      };
      expectTypeOf(config).toMatchTypeOf<DaVinciConfig>();
    });
  });

  describe('InternalDaVinciConfig', () => {
    it('should extend DaVinciConfig', () => {
      expectTypeOf<InternalDaVinciConfig>().toMatchTypeOf<DaVinciConfig>();
    });

    it('should require wellknownResponse', () => {
      const config: InternalDaVinciConfig = {
        wellknownResponse: {
          issuer: 'https://example.com',
          authorization_endpoint: 'https://example.com/auth',
          token_endpoint: 'https://example.com/token',
          userinfo_endpoint: 'https://example.com/userinfo',
          end_session_endpoint: 'https://example.com/logout',
          introspection_endpoint: 'https://example.com/introspect',
          revocation_endpoint: 'https://example.com/revoke',
        },
        responseType: 'code',
        serverConfig: {},
      };
      expectTypeOf(config).toMatchTypeOf<InternalDaVinciConfig>();
      expectTypeOf<InternalDaVinciConfig>().toHaveProperty('wellknownResponse').toBeObject();
    });

    it('should combine DaVinciConfig and wellknownResponse', () => {
      const config: InternalDaVinciConfig = {
        // DaVinciConfig properties
        clientId: 'test-client',
        scope: 'openid profile',
        serverConfig: {
          wellknown: 'https://example.com',
          timeout: 30000,
        },
        redirectUri: 'https://app.example.com/callback',
        responseType: 'code',
        // InternalDaVinciConfig specific property
        wellknownResponse: {
          issuer: 'https://example.com',
          authorization_endpoint: 'https://example.com/auth',
          token_endpoint: 'https://example.com/token',
          userinfo_endpoint: 'https://example.com/userinfo',
          end_session_endpoint: 'https://example.com/logout',
          introspection_endpoint: 'https://example.com/introspect',
          revocation_endpoint: 'https://example.com/revoke',
          // Optional properties
          jwks_uri: 'https://example.com/jwks',
          scopes_supported: ['openid', 'profile'],
        },
      };
      expectTypeOf(config).toMatchTypeOf<InternalDaVinciConfig>();
    });
  });
});

/**
 * WellKnownResponse type tests.
 *
 * Note: WellKnownResponse is now imported from @forgerock/sdk-types.
 * The type correctly follows the OIDC Discovery spec where only
 * issuer, authorization_endpoint, token_endpoint, and userinfo_endpoint
 * are required. Other properties are optional.
 */
describe('WellKnownResponse', () => {
  it('should have required OIDC properties', () => {
    // Minimal wellknown response with only required properties
    const wellknown: WellKnownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      end_session_endpoint: 'https://example.com/logout',
      introspection_endpoint: 'https://example.com/introspect',
      revocation_endpoint: 'https://example.com/revoke',
    };

    // Required properties should be strings
    expectTypeOf<WellKnownResponse>().toHaveProperty('issuer').toBeString();
    expectTypeOf<WellKnownResponse>().toHaveProperty('authorization_endpoint').toBeString();
    expectTypeOf<WellKnownResponse>().toHaveProperty('token_endpoint').toBeString();
    expectTypeOf<WellKnownResponse>().toHaveProperty('userinfo_endpoint').toBeString();
    expectTypeOf<WellKnownResponse>().toHaveProperty('end_session_endpoint').toBeString();
    expectTypeOf<WellKnownResponse>().toHaveProperty('introspection_endpoint').toBeString();
    expectTypeOf<WellKnownResponse>().toHaveProperty('revocation_endpoint').toBeString();

    expectTypeOf(wellknown).toMatchTypeOf<WellKnownResponse>();
  });

  it('should allow optional OIDC properties', () => {
    const wellknownWithOptionals: WellKnownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      end_session_endpoint: 'https://example.com/logout',
      introspection_endpoint: 'https://example.com/introspect',
      revocation_endpoint: 'https://example.com/revoke',
      // Optional properties
      jwks_uri: 'https://example.com/jwks',
      scopes_supported: ['openid', 'profile', 'email'],
      response_types_supported: ['code', 'token'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
    };

    // Test optional properties are allowed but not required
    expectTypeOf<WellKnownResponse>().toHaveProperty('scopes_supported');
    expectTypeOf<WellKnownResponse>().toHaveProperty('response_types_supported');
    expectTypeOf<WellKnownResponse>().toHaveProperty('grant_types_supported');
    expectTypeOf<WellKnownResponse>().toHaveProperty('jwks_uri');

    expectTypeOf(wellknownWithOptionals).toMatchTypeOf<WellKnownResponse>();
  });

  it('should validate optional array property types', () => {
    // Test that optional array properties are string[] | undefined
    expectTypeOf<WellKnownResponse['scopes_supported']>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<WellKnownResponse['response_types_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellKnownResponse['grant_types_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellKnownResponse['subject_types_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellKnownResponse['id_token_signing_alg_values_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellKnownResponse['token_endpoint_auth_methods_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
  });

  it('should enforce URL format for required endpoint properties', () => {
    const wellknown: WellKnownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      end_session_endpoint: 'https://example.com/logout',
      introspection_endpoint: 'https://example.com/introspect',
      revocation_endpoint: 'https://example.com/revoke',
    };

    // Type assertion to ensure required endpoint properties are strings (URLs)
    expectTypeOf(wellknown.authorization_endpoint).toBeString();
    expectTypeOf(wellknown.token_endpoint).toBeString();
    expectTypeOf(wellknown.userinfo_endpoint).toBeString();
  });
});
