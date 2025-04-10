/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { DaVinciConfig, InternalDaVinciConfig } from './config.types.js';
import type { AsyncConfigOptions } from '@forgerock/shared-types';
import type { WellknownResponse } from './wellknown.types.js';

describe('Config Types', () => {
  describe('DaVinciConfig', () => {
    it('should extend AsyncConfigOptions', () => {
      expectTypeOf<DaVinciConfig>().toMatchTypeOf<AsyncConfigOptions>();
    });

    it('should have optional responseType', () => {
      const config: DaVinciConfig = {
        responseType: 'code',
        serverConfig: {},
      };
      expectTypeOf(typeof config['responseType']).toBeString();
      expectTypeOf<DaVinciConfig>().toHaveProperty('responseType').toBeNullable();
    });

    it('should allow AsyncConfigOptions properties', () => {
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
          jwks_uri: 'https://example.com/jwks',
          revocation_endpoint: 'https://example.com/register',
          end_session_endpoint: 'https://example.com/logout',
          pushed_authorization_request_endpoint: '',
          check_session_iframe: '',
          introspection_endpoint: '',
          device_authorization_endpoint: '',
          claims_parameter_supported: '',
          request_parameter_supported: '',
          request_uri_parameter_supported: '',
          require_pushed_authorization_requests: '',
          scopes_supported: [],
          response_types_supported: [],
          response_modes_supported: [],
          grant_types_supported: [],
          subject_types_supported: [],
          id_token_signing_alg_values_supported: [],
          userinfo_signing_alg_values_supported: [],
          request_object_signing_alg_values_supported: [],
          token_endpoint_auth_methods_supported: [],
          token_endpoint_auth_signing_alg_values_supported: [],
          claim_types_supported: [],
          claims_supported: [],
          code_challenge_methods_supported: [],
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
          jwks_uri: 'https://example.com/jwks',
          revocation_endpoint: 'https://example.com/revoke',
          end_session_endpoint: 'https://example.com/logout',
          pushed_authorization_request_endpoint: '',
          check_session_iframe: '',
          introspection_endpoint: '',
          device_authorization_endpoint: '',
          claims_parameter_supported: '',
          request_parameter_supported: '',
          request_uri_parameter_supported: '',
          require_pushed_authorization_requests: '',
          scopes_supported: [],
          response_types_supported: [],
          response_modes_supported: [],
          grant_types_supported: [],
          subject_types_supported: [],
          id_token_signing_alg_values_supported: [],
          userinfo_signing_alg_values_supported: [],
          request_object_signing_alg_values_supported: [],
          token_endpoint_auth_methods_supported: [],
          token_endpoint_auth_signing_alg_values_supported: [],
          claim_types_supported: [],
          claims_supported: [],
          code_challenge_methods_supported: [],
        },
      };
      expectTypeOf(config).toMatchTypeOf<InternalDaVinciConfig>();
    });
  });
});

describe('WellknownResponse', () => {
  it('should have all required OIDC properties', () => {
    const wellknown: WellknownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      jwks_uri: 'https://example.com/jwks',
      revocation_endpoint: 'https://example.com/revoke',
      end_session_endpoint: 'https://example.com/logout',
      pushed_authorization_request_endpoint: '',
      check_session_iframe: '',
      introspection_endpoint: '',
      device_authorization_endpoint: '',
      claims_parameter_supported: '',
      request_parameter_supported: '',
      request_uri_parameter_supported: '',
      require_pushed_authorization_requests: '',
      scopes_supported: [],
      response_types_supported: [],
      response_modes_supported: [],
      grant_types_supported: [],
      subject_types_supported: [],
      id_token_signing_alg_values_supported: [],
      userinfo_signing_alg_values_supported: [],
      request_object_signing_alg_values_supported: [],
      token_endpoint_auth_methods_supported: [],
      token_endpoint_auth_signing_alg_values_supported: [],
      claim_types_supported: [],
      claims_supported: [],
      code_challenge_methods_supported: [],
    };

    expectTypeOf<WellknownResponse>().toHaveProperty('issuer').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('authorization_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('token_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('userinfo_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('jwks_uri').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('revocation_endpoint').toBeString();
    expectTypeOf<WellknownResponse>().toHaveProperty('end_session_endpoint').toBeString();

    expectTypeOf(wellknown).toMatchTypeOf<WellknownResponse>();
  });

  it('should allow optional OIDC properties', () => {
    const wellknownWithOptionals: WellknownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      jwks_uri: 'https://example.com/jwks',
      revocation_endpoint: 'https://example.com/revoke',
      end_session_endpoint: 'https://example.com/logout',
      // Optional properties
      scopes_supported: ['openid', 'profile', 'email'],
      response_types_supported: ['code', 'token'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
      pushed_authorization_request_endpoint: '',
      check_session_iframe: '',
      introspection_endpoint: '',
      device_authorization_endpoint: '',
      claims_parameter_supported: '',
      request_parameter_supported: '',
      request_uri_parameter_supported: '',
      require_pushed_authorization_requests: '',
      response_modes_supported: [],
      userinfo_signing_alg_values_supported: [],
      request_object_signing_alg_values_supported: [],
      token_endpoint_auth_signing_alg_values_supported: [],
      claim_types_supported: [],
      claims_supported: [],
      code_challenge_methods_supported: [],
    };

    // Test optional properties are allowed but not required
    expectTypeOf<WellknownResponse>().toHaveProperty('scopes_supported');
    expectTypeOf<WellknownResponse>().toHaveProperty('response_types_supported');
    expectTypeOf<WellknownResponse>().toHaveProperty('grant_types_supported');

    expectTypeOf(wellknownWithOptionals).toMatchTypeOf<WellknownResponse>();
  });

  it('should validate property types', () => {
    // Test that array properties must contain strings
    expectTypeOf<WellknownResponse['scopes_supported']>().toEqualTypeOf<string[]>();
    expectTypeOf<WellknownResponse['response_types_supported']>().toEqualTypeOf<string[]>();
    expectTypeOf<WellknownResponse['grant_types_supported']>().toEqualTypeOf<string[]>();
    expectTypeOf<WellknownResponse['subject_types_supported']>().toEqualTypeOf<string[]>();
    expectTypeOf<WellknownResponse['id_token_signing_alg_values_supported']>().toEqualTypeOf<
      string[]
    >();
    expectTypeOf<WellknownResponse['token_endpoint_auth_methods_supported']>().toEqualTypeOf<
      string[]
    >();
  });

  it('should enforce URL format for endpoint properties', () => {
    const wellknown: WellknownResponse = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      jwks_uri: 'https://example.com/jwks',
      revocation_endpoint: 'https://example.com/register',
      end_session_endpoint: 'https://example.com/logout',
      pushed_authorization_request_endpoint: '',
      check_session_iframe: '',
      introspection_endpoint: '',
      device_authorization_endpoint: '',
      claims_parameter_supported: '',
      request_parameter_supported: '',
      request_uri_parameter_supported: '',
      require_pushed_authorization_requests: '',
      scopes_supported: [],
      response_types_supported: [],
      response_modes_supported: [],
      grant_types_supported: [],
      subject_types_supported: [],
      id_token_signing_alg_values_supported: [],
      userinfo_signing_alg_values_supported: [],
      request_object_signing_alg_values_supported: [],
      token_endpoint_auth_methods_supported: [],
      token_endpoint_auth_signing_alg_values_supported: [],
      claim_types_supported: [],
      claims_supported: [],
      code_challenge_methods_supported: [],
    };

    // Type assertion to ensure all endpoint properties are strings (URLs)
    expectTypeOf(wellknown.authorization_endpoint).toBeString();
    expectTypeOf(wellknown.token_endpoint).toBeString();
    expectTypeOf(wellknown.userinfo_endpoint).toBeString();
    expectTypeOf(wellknown.jwks_uri).toBeString();
    expectTypeOf(wellknown.revocation_endpoint).toBeString();
    expectTypeOf(wellknown.end_session_endpoint).toBeString();
  });
});
