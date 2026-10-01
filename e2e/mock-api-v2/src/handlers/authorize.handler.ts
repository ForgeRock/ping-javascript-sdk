/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, pipe } from 'effect';
import { HttpServerResponse } from 'effect/http';
import { HttpApiBuilder, HttpApiError } from 'effect/http-api';

import { getFirstElementAndRespond } from '../services/mock-env-helpers/index.js';
import { MockApi } from '../spec.js';

const AuthorizeHandlerMock = HttpApiBuilder.group(MockApi, 'Authorization', (handlers) =>
  handlers.handle('authorize', ({ query: urlParams }) =>
    Effect.gen(function* () {
      const acr_value = urlParams?.acr_values ?? '';

      const body = yield* getFirstElementAndRespond(urlParams);

      const res = yield* pipe(
        HttpServerResponse.json(body),
        Effect.flatMap(HttpServerResponse.setCookie('acr_values', acr_value, { path: '/' })),
        Effect.catchTags({
          CookiesError: () => Effect.fail(new HttpApiError.InternalServerError()),
          HttpBodyError: () => Effect.fail(new HttpApiError.InternalServerError()),
        }),
      );

      return res;
    }).pipe(Effect.withSpan('DavinciAuthorize')),
  ),
);

export { AuthorizeHandlerMock };
