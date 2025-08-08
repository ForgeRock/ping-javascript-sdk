/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Schema } from 'effect';

const UsernamePassword = Schema.Struct({
  actionKey: Schema.String,
  formData: Schema.Struct({
    username: Schema.String,
    password: Schema.String,
  }),
});

const CapabilitiesRequestBody = Schema.Struct({
  id: Schema.String,
  eventName: Schema.String,
  interactionId: Schema.String,
  parameters: Schema.Struct({
    eventType: Schema.String,
    data: Schema.Union(UsernamePassword),
  }),
});

export { CapabilitiesRequestBody };
