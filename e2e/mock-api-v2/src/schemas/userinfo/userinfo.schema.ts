/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Context, Schema } from 'effect';

class UserInfoSchema extends Schema.Class<UserInfoSchema>('UserInfo')(
  Schema.Struct({
    sub: Schema.String,
    preferred_username: Schema.String,
    given_name: Schema.String,
    updated_at: Schema.Number,
    family_name: Schema.String,
    email: Schema.String,
    env: Schema.String,
    org: Schema.String,
    'p1.region': Schema.String,
  }),
) {}

class UserInfoTagged extends Context.Tag('UserInfoTagged')<UserInfoTagged, UserInfoSchema>() {}

export { UserInfoTagged, UserInfoSchema };
