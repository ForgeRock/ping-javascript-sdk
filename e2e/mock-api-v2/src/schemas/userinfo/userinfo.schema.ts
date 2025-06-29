/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';

/**
 * Schema for UserInfo response according to OpenID Connect Core specification.
 * Contains standard claims about the authenticated end-user.
 */
class UserInfoSchema extends Schema.Class<UserInfoSchema>('UserInfo')(
  Schema.Struct({
    // Standard OIDC claims
    sub: Schema.String, // Subject - Identifier for the user
    preferred_username: Schema.String, // User's preferred username
    given_name: Schema.String, // User's given (first) name
    family_name: Schema.String, // User's family (last) name
    email: Schema.String, // User's email address
    updated_at: Schema.Number, // Last update timestamp

    // PingOne specific claims
    env: Schema.String, // PingOne environment identifier
    org: Schema.String, // PingOne organization identifier
    'p1.region': Schema.String, // PingOne region identifier
  }),
) {}

export { UserInfoSchema };
