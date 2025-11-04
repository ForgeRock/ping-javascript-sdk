/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { it, expect } from '@effect/vitest';
import { Micro } from 'effect';
import { buildAuthorizeOptionsµ } from './authorize.request.utils.js';
import { OidcConfig } from './config.types.js';
import { WellKnownResponse } from '@forgerock/sdk-types';

const clientId = '123456789';
const redirectUri = 'https://example.com/callback.html';
const scope = 'openid profile';
const responseType = 'code';
const config: OidcConfig = {
  clientId,
  redirectUri,
  scope,
  serverConfig: {
    wellknown: 'https://example.com/wellknown',
  },
  responseType,
};
const wellknown: WellKnownResponse = {
  issuer: 'https://example.com/issuer',
  authorization_endpoint: 'https://example.com/authorize',
  token_endpoint: 'https://example.com/token',
  userinfo_endpoint: 'https://example.com/userinfo',
  end_session_endpoint: 'https://example.com/endSession',
  introspection_endpoint: 'https://example.com/introspect',
  revocation_endpoint: 'https://example.com/revoke',
};

it.effect('buildAuthorizeOptionsµ succeeds with BuildAuthorizationData', () =>
  Micro.gen(function* () {
    const result = yield* buildAuthorizeOptionsµ(wellknown, config);

    expect(result).toStrictEqual([
      wellknown.authorization_endpoint,
      {
        clientId,
        redirectUri,
        scope,
        responseType,
      },
    ]);
  }),
);

it.effect('buildAuthorizeOptionsµ with pi.flow succeeds with BuildAuthorizationData', () =>
  Micro.gen(function* () {
    const result = yield* buildAuthorizeOptionsµ(wellknown, config, { responseMode: 'pi.flow' });

    expect(result).toStrictEqual([
      wellknown.authorization_endpoint,
      {
        clientId,
        redirectUri,
        scope,
        responseType,
        responseMode: 'pi.flow',
      },
    ]);
  }),
);
