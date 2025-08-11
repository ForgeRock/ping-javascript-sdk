/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { it, expect } from '@effect/vitest';
import { Micro } from 'effect';
import { handleTokenResponseµ, validateValuesµ } from './exchange.utils.js';
import { OidcConfig } from './config.types.js';
import { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

const clientId = '123456789';
const redirectUri = 'https://example.com/callback.html';
const scope = 'openid profile';
const state = 'xyz789';
const code = 'abc123';
const responseType = 'code';
const tokenEndpoint = 'https://example.com/token';
const config: OidcConfig = {
  clientId,
  redirectUri,
  scope,
  serverConfig: {
    wellknown: 'https://example.com/wellknown',
  },
  responseType,
};
const storedValues: GetAuthorizationUrlOptions = {
  state,
  responseType,
  clientId,
  scope,
  redirectUri,
};

it.effect('validateValuesµ succeeds with TokenRequestOptions', () =>
  Micro.gen(function* () {
    const result = yield* validateValuesµ({
      code,
      state,
      storedValues,
      config,
      endpoint: tokenEndpoint,
    });

    expect(result).toStrictEqual({
      code,
      config,
      endpoint: tokenEndpoint,
    });
  }),
);

it.effect('validateValuesµ with verifier succeeds with TokenRequestOptions', () =>
  Micro.gen(function* () {
    const verifier = 'verifier123';
    const result = yield* validateValuesµ({
      code,
      state,
      storedValues: {
        ...storedValues,
        verifier,
      },
      config,
      endpoint: tokenEndpoint,
    });

    expect(result).toStrictEqual({
      code,
      config,
      endpoint: tokenEndpoint,
      verifier,
    });
  }),
);

it.effect('validateValuesµ fails with state mismatch', () =>
  Micro.gen(function* () {
    const result = yield* Micro.exit(
      validateValuesµ({
        code,
        state: 'abcState',
        storedValues: {
          ...storedValues,
          state: 'xyzState',
        },
        config,
        endpoint: tokenEndpoint,
      }),
    );

    expect(result).toStrictEqual(
      Micro.fail({
        error: 'State mismatch',
        message:
          'The provided state does not match the stored state. This is likely due to passing in used, returned, authorize parameters.',
        type: 'state_error',
      }),
    );
  }),
);

it.effect('handleTokenResponseµ with data succeeds', () => {
  const data = {
    access_token: '12345',
    id_token: '67890',
  };

  return Micro.gen(function* () {
    const result = yield* handleTokenResponseµ(data);

    expect(result).toStrictEqual(data);
  });
});

it.effect('handleTokenResponseµ with no data fails', () => {
  return Micro.gen(function* () {
    const result = yield* Micro.exit(handleTokenResponseµ(undefined));

    expect(result).toStrictEqual(
      Micro.fail({
        error: 'Token Exchange failure',
        message: 'No data returned from token exchange',
        type: 'exchange_error',
      }),
    );
  });
});

it.effect('handleTokenResponseµ with error fails', () => {
  const errMessage = 'Fetch error message';
  return Micro.gen(function* () {
    const result = yield* Micro.exit(
      handleTokenResponseµ(undefined, {
        status: 'FETCH_ERROR',
        error: errMessage,
      }),
    );

    expect(result).toStrictEqual(
      Micro.fail({
        error: 'Token Exchange failure',
        message: errMessage,
        type: 'exchange_error',
      }),
    );
  });
});
