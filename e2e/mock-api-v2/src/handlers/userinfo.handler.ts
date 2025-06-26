/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';
import { MockApi } from '../spec.js';
import { UserInfo } from '../services/userinfo.service.js';
import { HttpApiBuilder } from '@effect/platform';
import { BearerToken } from '../middleware/Authorization.js';

/**
 * TODO: Need to implement an Authorization middleware
 */
const UserInfoMockHandler = HttpApiBuilder.group(MockApi, 'Protected Requests', (handlers) =>
  handlers.handle('UserInfo', () =>
    Effect.gen(function* () {
      const authToken = yield* BearerToken;
      const { getUserInfo } = yield* UserInfo;

      const response = yield* getUserInfo(authToken);

      return response;
    }),
  ),
);

export { UserInfoMockHandler };
