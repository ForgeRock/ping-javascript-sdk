/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';

const FormDataResponseUsernamePassword = Schema.Struct({
  username: Schema.String,
  password: Schema.String,
});

const PingProtectSDKResponse = Schema.Struct({ pingprotectsdk: Schema.String });

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

export {
  FormDataResponseUsernamePassword,
  PingProtectSDKResponse,
  ProtectSDKRequestFormData,
  UsernamePasswordFormData,
};
