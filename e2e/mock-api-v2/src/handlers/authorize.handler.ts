/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';

import { Authorize } from '../services/authorize.service.js';
import { MockApi } from '../spec.js';
import { HttpApiBuilder } from '@effect/platform';

const AuthorizeHandlerMock = HttpApiBuilder.group(MockApi, 'Authorization', (handlers) =>
  handlers.handle('DavinciAuthorize', ({ urlParams }) =>
    Effect.gen(function* () {
      const { handleAuthorize } = yield* Authorize;

      const response = yield* handleAuthorize(urlParams);

      return response.body;
    }),
  ),
);

export { AuthorizeHandlerMock };
