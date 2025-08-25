/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';
import { MockApi } from '../spec.js';
import { HttpApiBuilder, HttpServerResponse } from '@effect/platform';
import { getFirstElementAndRespond } from '../services/mock-env-helpers/index.js';

const AuthorizeHandlerMock = HttpApiBuilder.group(MockApi, 'Authorization', (handlers) =>
  handlers.handle('authorize', ({ urlParams }) =>
    Effect.gen(function* () {
      const acr_value = urlParams?.acr_values ?? '';

      const response = yield* getFirstElementAndRespond(urlParams);

      return HttpServerResponse.setCookie(response, 'acr_values', acr_value);
    }).pipe(Effect.withSpan('DavinciAuthorize')),
  ),
);

export { AuthorizeHandlerMock };
