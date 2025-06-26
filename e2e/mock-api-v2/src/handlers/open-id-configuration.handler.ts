/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';
import { MockApi } from '../spec.js';
import { openidConfigurationResponse } from '../responses/open-id-configuration.js';
import { HttpApiBuilder } from '@effect/platform';

/**
 * TODO: This needs to make a request for an openid configuration in a LIVE environment
 * The proper way is to probably create a LIVE (effect convention) route, that handles this
 * then the LIVE app is provided the HttpClient needed
 *
 *
 */
const OpenidConfigMock = HttpApiBuilder.group(MockApi, 'OpenIDConfig', (handlers) =>
  handlers.handle(
    'openid',
    Effect.fn('OpenId')(function* () {
      const value = yield* Effect.succeed(openidConfigurationResponse);
      return value;
    }),
  ),
);

export { OpenidConfigMock };
