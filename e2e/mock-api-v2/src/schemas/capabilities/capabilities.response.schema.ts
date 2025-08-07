/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';

const ProtectSDKRequestFormData = Schema.Struct({
  value: Schema.Struct({
    protectsdk: Schema.String,
  }),
});

const UsernamePasswordFormData = Schema.Struct({
  value: Schema.Struct({
    username: Schema.String,
    password: Schema.String,
  }),
});

const FormData = Schema.Union(UsernamePasswordFormData, ProtectSDKRequestFormData);

const CapabilitiesResponse = Schema.Struct({
  interactionId: Schema.String,
  interactionToken: Schema.String,
  _links: Schema.Struct({
    next: Schema.Struct({
      href: Schema.String,
    }),
  }),
  eventName: Schema.String,
  isResponseCompatibleWithMobileAndWebSdks: Schema.Boolean,
  id: Schema.String,
  companyId: Schema.String,
  flowId: Schema.String,
  connectionId: Schema.String,
  capabilityName: Schema.String,
  form: Schema.Struct({
    name: Schema.String,
    description: Schema.String,
    category: Schema.String,
    components: Schema.Struct({
      fields: Schema.Array(
        Schema.Struct({
          type: Schema.String,
          key: Schema.String,
          label: Schema.UndefinedOr(Schema.String),
        }),
      ),
    }),
  }),
  formData: FormData,
});

export { CapabilitiesResponse, FormData, UsernamePasswordFormData };
