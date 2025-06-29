/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';

// Path parameters schema for the endSession endpoint
const EndSessionPath = Schema.Struct({
  envid: Schema.String,
});

// URL query parameters for endSession
const EndSessionQuery = Schema.Struct({
  id_token_hint: Schema.optional(Schema.String),
  post_logout_redirect_uri: Schema.optional(Schema.String),
  state: Schema.optional(Schema.String),
});

// Request headers schema
const EndSessionHeaders = Schema.Struct({
  cookie: Schema.optional(Schema.String),
});

export { EndSessionPath, EndSessionQuery, EndSessionHeaders };
