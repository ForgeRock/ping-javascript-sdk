/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { DaVinciConfig, InternalDaVinciConfig } from './config.types.js';
import type { AsyncLegacyConfigOptions, WellknownResponse } from '@forgerock/sdk-types';

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
        clientId: 'test-client',
        scope: 'openid profile',
        serverConfig: {
          wellknown: 'https://example.com',
          timeout: 30000,
        },
        redirectUri: 'https://app.example.com/callback',
        responseType: 'code',
        wellknownResponse: {
          issuer: 'https://example.com',
          authorization_endpoint: 'https://example.com/auth',
          token_endpoint: 'https://example.com/token',
          userinfo_endpoint: 'https://example.com/userinfo',
          end_session_endpoint: 'https://example.com/logout',
          introspection_endpoint: 'https://example.com/introspect',
          revocation_endpoint: 'https://example.com/revoke',
          jwks_uri: 'https://example.com/jwks',
          scopes_supported: ['openid', 'profile'],
        },
      };
      expectTypeOf(config).toMatchTypeOf<InternalDaVinciConfig>();
    });
  });
});

describe('WellknownResponse', () => {
  it('should have required OIDC properties', () => {
    const wellknown: WellknownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      end_session_endpoint: 'https://example.com/logout',
      introspection_endpoint: 'https://example.com/introspect',
      revocation_endpoint: 'https://example.com/revoke',
    };

    expectTypeOf<WellknownResponse>().toHaveProperty('issuer').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('authorization_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('token_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('userinfo_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('end_session_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('introspection_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('revocation_endpoint').toBeString();

    expectTypeOf(wellknown).toMatchTypeOf<WellknownResponse>();
  });

  it('should allow optional OIDC properties', () => {
    const wellknownWithOptionals: WellknownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      end_session_endpoint: 'https://example.com/logout',
      introspection_endpoint: 'https://example.com/introspect',
      revocation_endpoint: 'https://example.com/revoke',
      jwks_uri: 'https://example.com/jwks',
      scopes_supported: ['openid', 'profile', 'email'],
      response_types_supported: ['code', 'token'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
    };

    expectTypeOf<WellknownResponse>().toHaveProperty('scopes_supported');
    expectTypeOf<WellknownResponse>().toHaveProperty('response_types_supported');
    expectTypeOf<WellknownResponse>().toHaveProperty('grant_types_supported');
    expectTypeOf<WellknownResponse>().toHaveProperty('jwks_uri');

    expectTypeOf(wellknownWithOptionals).toMatchTypeOf<WellknownResponse>();
  });

  it('should validate optional array property types', () => {
    expectTypeOf<WellknownResponse['scopes_supported']>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<WellknownResponse['response_types_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellknownResponse['grant_types_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellknownResponse['subject_types_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellknownResponse['id_token_signing_alg_values_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<WellknownResponse['token_endpoint_auth_methods_supported']>().toEqualTypeOf<
      string[] | undefined
    >();
  });

  it('should enforce URL format for required endpoint properties', () => {
    const wellknown: WellknownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      end_session_endpoint: 'https://example.com/logout',
      introspection_endpoint: 'https://example.com/introspect',
      revocation_endpoint: 'https://example.com/revoke',
    };

    expectTypeOf(wellknown.authorization_endpoint).toBeString();
    expectTypeOf(wellknown.token_endpoint).toBeString();
    expectTypeOf(wellknown.userinfo_endpoint).toBeString();
  });
});
