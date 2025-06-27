/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';

// The environment ID path parameter
const RevokePath = Schema.Struct({
  envid: Schema.String,
});

// Request body for token revocation according to RFC 7009
const RevokeRequestBody = Schema.Struct({
  token: Schema.String, // The token to be revoked
  token_type_hint: Schema.optional(
    Schema.Union(Schema.Literal('access_token'), Schema.Literal('refresh_token')),
  ), // Hint about token type (access_token or refresh_token)
  client_id: Schema.optional(Schema.String), // OAuth 2.0 client identifier
  client_secret: Schema.optional(Schema.String), // OAuth 2.0 client secret
});

// Simple success response
const RevokeResponseBody = Schema.Struct({
  status: Schema.Literal('success'), // Indicates successful token revocation
});

export { RevokePath, RevokeRequestBody, RevokeResponseBody };
