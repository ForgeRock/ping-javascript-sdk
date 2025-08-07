/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Schema } from 'effect';

export const CapabilitiesQueryParams = Schema.Struct({
  acr_values: Schema.optional(Schema.String), // optional
  redirect_uri: Schema.optional(Schema.String), // optional
  state: Schema.optional(Schema.String), // optional
  nonce: Schema.optional(Schema.String), // optional
  scope: Schema.optional(Schema.String), // optional
  response_type: Schema.optional(Schema.String), // optional
  client_id: Schema.optional(Schema.String), // optional
  prompt: Schema.optional(Schema.String), // optional
  login_hint: Schema.optional(Schema.String), // optional
});
