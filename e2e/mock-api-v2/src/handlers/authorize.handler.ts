/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';

import { MockApi } from '../spec.js';
import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { getFirstElementAndRespond } from '../services/mock-env-helpers/index.js';

const AuthorizeHandlerMock = HttpApiBuilder.group(MockApi, 'Authorization', (handlers) =>
  handlers.handle('authorize', ({ urlParams }) =>
    Effect.gen(function* () {
      /**
       * We expect an acr_value query parameter to be present in the request.
       * If it is not present, we return a 404 Not Found error.
       */
      const acr_value = urlParams?.acr_values ?? '';

      if (!acr_value) {
        return yield* Effect.fail(new HttpApiError.NotFound());
      }

      const response = yield* getFirstElementAndRespond(urlParams);

      return response;
    }).pipe(Effect.withSpan('DavinciAuthorize')),
  ),
);

export { AuthorizeHandlerMock };
