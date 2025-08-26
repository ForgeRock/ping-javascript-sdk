/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';
import { MockApi } from '../spec.js';
import { HttpApiBuilder } from '@effect/platform';
import { HttpServerRequest } from '@effect/platform/HttpServerRequest';

const OpenidConfigMock = HttpApiBuilder.group(MockApi, 'OpenIDConfig', (handlers) =>
  handlers.handle('openid', ({ path: { envid } }) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest;
      const url = new URL(request.url);
      const issuer = `${url.protocol}//${url.host}/${envid}/as`;
      return {
        issuer,
        authorization_endpoint: `${issuer}/authorize`,
        pushed_authorization_request_endpoint: `${issuer}/par`,
        token_endpoint: `${issuer}/token`,
        userinfo_endpoint: `${issuer}/userinfo`,
        jwks_uri: `${issuer}/jwks`,
        end_session_endpoint: `${issuer}/signoff`,
        check_session_iframe: `${issuer}/checksession`,
        introspection_endpoint: `${issuer}/introspect`,
        revocation_endpoint: `${issuer}/revoke`,
        device_authorization_endpoint: `${issuer}/device_authorization`,
        claims_parameter_supported: false,
        request_parameter_supported: true,
        request_uri_parameter_supported: false,
        require_pushed_authorization_requests: false,
        scopes_supported: ['openid', 'profile', 'email', 'address', 'phone'],
        response_types_supported: [
          'code',
          'id_token',
          'token id_token',
          'code id_token',
          'code token',
          'code token id_token',
        ],
        response_modes_supported: ['pi.flow', 'query', 'fragment', 'form_post'],
        grant_types_supported: [
          'authorization_code',
          'implicit',
          'client_credentials',
          'refresh_token',
          'urn:ietf:params:oauth:grant-type:device_code',
        ],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        userinfo_signing_alg_values_supported: ['none'],
        request_object_signing_alg_values_supported: [
          'none',
          'HS256',
          'HS384',
          'HS512',
          'RS256',
          'RS384',
          'RS512',
        ],
        token_endpoint_auth_methods_supported: [
          'client_secret_basic',
          'client_secret_post',
          'client_secret_jwt',
          'private_key_jwt',
        ],
        token_endpoint_auth_signing_alg_values_supported: [
          'HS256',
          'HS384',
          'HS512',
          'RS256',
          'RS384',
          'RS512',
        ],
        claim_types_supported: ['normal'],
        claims_supported: [
          'sub',
          'iss',
          'auth_time',
          'acr',
          'name',
          'given_name',
          'family_name',
          'middle_name',
          'preferred_username',
          'profile',
          'picture',
          'zoneinfo',
          'phone_number',
          'updated_at',
          'address',
          'email',
          'locale',
        ],
        code_challenge_methods_supported: ['plain', 'S256'],
      };
    }),
  ),
);

export { OpenidConfigMock };
