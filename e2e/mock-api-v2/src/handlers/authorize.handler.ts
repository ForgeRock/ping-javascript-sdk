/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, pipe } from 'effect';
import { MockApi } from '../spec.js';
import { HttpApiBuilder, HttpApiError, HttpServerResponse } from '@effect/platform';
import { getFirstElementAndRespond } from '../services/mock-env-helpers/index.js';

const AuthorizeHandlerMock = HttpApiBuilder.group(MockApi, 'Authorization', (handlers) =>
  handlers.handle('authorize', ({ urlParams }) =>
    Effect.gen(function* () {
      const acr_value = urlParams?.acr_values ?? '';

      const body = yield* getFirstElementAndRespond(urlParams);

      const res = yield* pipe(
        HttpServerResponse.json(body),
        HttpServerResponse.setCookie('acr_values', acr_value),
        Effect.catchTag('CookieError', () => new HttpApiError.InternalServerError()),
      );

      return res;
    }).pipe(Effect.withSpan('DavinciAuthorize')),
  ),
);

export { AuthorizeHandlerMock };
