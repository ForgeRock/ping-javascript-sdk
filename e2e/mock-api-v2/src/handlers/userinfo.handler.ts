/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { Effect } from 'effect';

import { BearerToken } from '../middleware/Authorization.js';
import { UserInfo } from '../services/userinfo.service.js';
import { MockApi } from '../spec.js';

const UserInfoMockHandler = HttpApiBuilder.group(MockApi, 'ProtectedRequests', (handlers) =>
  handlers.handle('UserInfo', () =>
    Effect.gen(function* () {
      const authToken = yield* BearerToken;

      if (!authToken) {
        return yield* Effect.fail(new HttpApiError.Unauthorized());
      }

      const { getUserInfo } = yield* UserInfo;

      const response = yield* getUserInfo(authToken);

      return response;
    }).pipe(Effect.withSpan('UserInfoHandler')),
  ),
);

export { UserInfoMockHandler };
