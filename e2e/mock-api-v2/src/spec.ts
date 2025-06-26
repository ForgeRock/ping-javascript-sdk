/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup } from '@effect/platform';
import { openIdConfigurationResponseSchema } from './schemas/open-id-configuration/open-id-configuration-response.schema.js';
import {
  AuthorizePath,
  DavinciAuthorizeHeaders,
  DavinciAuthorizeQuery,
} from './schemas/authorize.schema.js';
import { PingOneCustomHtmlResponseBody } from './schemas/custom-html-template/custom-html-template-response.schema.js';
import { TokenResponseBody } from './schemas/token/token.schema.js';
import { UserInfoSchema } from './schemas/userinfo/userinfo.schema.js';

const MockApi = HttpApi.make('MyApi')
  .add(
    HttpApiGroup.make('Healthcheck').add(
      HttpApiEndpoint.get('HealthCheck')`/healthcheck`.addSuccess(Schema.String),
    ),
  )
  .add(
    HttpApiGroup.make('OpenIDConfig').add(
      HttpApiEndpoint.get('openid')`/:envid/as/.well-known/openid-configuration`
        .setPath(Schema.Struct({ envid: Schema.String }))
        .addSuccess(openIdConfigurationResponseSchema),
    ),
  )
  .add(
    HttpApiGroup.make('Authorization').add(
      HttpApiEndpoint.get('DavinciAuthorize')`/:envid/as/authorize`
        .setPath(AuthorizePath)
        .setUrlParams(DavinciAuthorizeQuery)
        .setHeaders(DavinciAuthorizeHeaders)
        .addSuccess(PingOneCustomHtmlResponseBody)
        .addError(HttpApiError.NotFound),
    ),
  )
  .add(
    HttpApiGroup.make('Tokens').add(
      HttpApiEndpoint.post('Tokens')`/envid/as/token`
        .addSuccess(TokenResponseBody)
        .addError(HttpApiError.Unauthorized)
        .setPath(Schema.Struct({ envid: Schema.String })),
    ),
  )
  .add(
    HttpApiGroup.make('Protected Requests').add(
      HttpApiEndpoint.get('UserInfo')`/:envid/as/userinfo`
        .setPath(Schema.Struct({ envid: Schema.String }))
        .addSuccess(UserInfoSchema)
        .addError(HttpApiError.Unauthorized)
        .addError(HttpApiError.InternalServerError),
    ),
  );

export { MockApi };
