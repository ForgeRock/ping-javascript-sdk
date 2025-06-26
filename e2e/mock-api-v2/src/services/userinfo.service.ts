/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Layer, Schema } from 'effect';
import { Effect, Context } from 'effect';

import { userInfoResponse } from '../responses/userinfo/userinfo.js';
import { UserInfoSchema } from '../schemas/userinfo/userinfo.schema.js';
import { HttpApiError } from '@effect/platform';

/***
 * This file should be converted to a Layer that uses Request
 */

type UserInfoResponse = Schema.Schema.Type<typeof UserInfoSchema>;

class UserInfo extends Context.Tag('@services/userinfo')<
  UserInfo,
  {
    getUserInfo: (
      token: string,
    ) => Effect.Effect<UserInfoResponse, HttpApiError.Unauthorized, never>;
  }
>() {}

const UserInfoMockService = Layer.succeed(
  UserInfo,
  UserInfo.of({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserInfo: (_: string) =>
      Effect.tryPromise({
        try: () => Promise.resolve(userInfoResponse),
        catch: () => new HttpApiError.Unauthorized(),
      }),
  }),
);

export { UserInfo, UserInfoMockService };
