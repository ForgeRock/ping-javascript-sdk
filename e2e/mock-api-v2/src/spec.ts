/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from '@effect/platform';
import { openIdConfigurationResponseSchema } from './schemas/open-id-configuration/open-id-configuration-response.schema.js';
import { TokenResponseBody } from './schemas/token/token.schema.js';
import { UserInfoSchema } from './schemas/userinfo/userinfo.schema.js';
import { Authorization } from './middleware/Authorization.js';
import { SessionMiddleware } from './middleware/Session.js';
import {
  EndSessionQuery,
  EndSessionHeaders,
  EndSessionPath,
} from './schemas/end-session.schema.js';
import {
  RevokePath,
  RevokeRequestBody,
  RevokeResponseBody,
} from './schemas/revoke/revoke.schema.js';

import { CapabilitiesHeaders } from './schemas/capabilities/capabilities.headers.schema.js';
import { CapabilitiesResponse } from './schemas/capabilities/capabilities.response.schema.js';
import { DavinciAuthorizeHeaders, DavinciAuthorizeQuery } from './schemas/authorize.schema.js';
import { CapabilitiesPathParams } from './schemas/capabilities/capabilities.path.schema.js';
import { CapabilitiesRequestBody } from './schemas/capabilities/capabilities.request.schema.js';
import { addStepCookie } from './addStepCookie.openapi.js';
import { IncrementStepIndex } from './middleware/CookieMiddleware.js';

const MockApi = HttpApi.make('MyApi')
  .annotate(OpenApi.Title, 'PingOne OIDC and OAuth2 Mock API')
  .annotate(OpenApi.Version, '1.0.0')
  .annotate(OpenApi.Transform, addStepCookie)
  .annotate(
    OpenApi.Description,
    'Mock API for PingOne OIDC and OAuth2 flows including authorization, token issuance, token validation, token revocation, and end session. All endpoints are grouped under PingAM for unified testing.',
  )
  .annotate(OpenApi.License, { name: 'MIT License', url: 'https://opensource.org/licenses/MIT' })
  .annotate(OpenApi.Servers, [
    { url: 'http://localhost:9443', description: 'Local development server' },
  ])
  // Healthcheck
  .add(
    HttpApiGroup.make('Healthcheck').add(
      HttpApiEndpoint.get('HealthCheck')`/healthcheck`
        .addSuccess(Schema.String)
        .annotate(OpenApi.Summary, 'Server Health Check')
        .annotate(
          OpenApi.Description,
          'Returns a simple health status to verify the server is operational',
        ),
    ),
  )
  // Authorization
  .add(
    HttpApiGroup.make('Authorization').add(
      HttpApiEndpoint.get('authorize', `/:envid/davinci/authorize`)
        .setPath(Schema.Struct({ envid: Schema.String }))
        .setHeaders(DavinciAuthorizeHeaders)
        .setUrlParams(DavinciAuthorizeQuery)
        .addSuccess(CapabilitiesResponse)
        .addError(HttpApiError.NotFound)
        .addError(HttpApiError.InternalServerError)
        .annotate(OpenApi.Summary, 'Authorization Endpoint')
        .annotate(
          OpenApi.Description,
          'Initiates the authorization process and returns a URL for the user to authenticate',
        ),
    ),
  )
  // Capabilities
  .add(
    HttpApiGroup.make('Capabilities')
      .add(
        HttpApiEndpoint.post(
          'capabilities',
          `/:envid/davinci/connections/:connectionID/capabilities/:capabilityName`,
        )
          .setPayload(CapabilitiesRequestBody)
          .setPath(CapabilitiesPathParams)

          .setHeaders(CapabilitiesHeaders)
          .addSuccess(CapabilitiesResponse)
          .addError(HttpApiError.NotFound)
          .addError(HttpApiError.Unauthorized)
          .addError(HttpApiError.InternalServerError),
      )
      .middleware(IncrementStepIndex),
  )
  .add(
    HttpApiGroup.make('OpenIDConfig').add(
      HttpApiEndpoint.get('openid', `/:envid/as/.well-known/openid-configuration`)
        .setPath(Schema.Struct({ envid: Schema.String }))
        .addSuccess(openIdConfigurationResponseSchema)
        .annotate(OpenApi.Summary, 'OIDC Configuration')
        .annotate(
          OpenApi.Description,
          'Returns the OpenID Connect configuration for this provider including available endpoints and supported features',
        ),
    ),
  )
  // Tokens
  .add(
    HttpApiGroup.make('Tokens')
      .add(
        HttpApiEndpoint.post('Tokens', `/:envid/as/token`)
          .addSuccess(TokenResponseBody)
          .addError(HttpApiError.Unauthorized)
          .setPath(Schema.Struct({ envid: Schema.String }))
          .annotate(OpenApi.Summary, 'Token Endpoint')
          .annotate(
            OpenApi.Description,
            'Issues access tokens, ID tokens, and refresh tokens after successful authentication',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware),
  )
  // Protected Requests
  .add(
    HttpApiGroup.make('ProtectedRequests')
      .add(
        HttpApiEndpoint.get('UserInfo', `/:envid/as/userinfo`)
          .setPath(Schema.Struct({ envid: Schema.String }))
          .addSuccess(UserInfoSchema)
          .addError(HttpApiError.Unauthorized)
          .annotate(OpenApi.Summary, 'UserInfo Endpoint')
          .annotate(
            OpenApi.Description,
            'Returns claims about the authenticated end-user. Requires a valid access token.',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware),
  )
  // SessionManagement
  .add(
    HttpApiGroup.make('SessionManagement')
      .add(
        HttpApiEndpoint.get('EndSession', `/:envid/as/endSession`)
          .setPath(EndSessionPath)
          .setUrlParams(EndSessionQuery)
          .setHeaders(EndSessionHeaders)
          .addSuccess(
            Schema.Union(
              Schema.String,
              Schema.Struct({
                status: Schema.Number,
                headers: Schema.Record({ key: Schema.String, value: Schema.String }),
                body: Schema.String,
              }),
            ),
          )
          .addError(HttpApiError.Unauthorized)
          .annotate(OpenApi.Summary, 'End Session Endpoint')
          .annotate(
            OpenApi.Description,
            'OIDC RP-initiated logout endpoint that terminates the user session and invalidates tokens',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware),
  )
  // Protected Requests
  .add(
    HttpApiGroup.make('ProtectedRequests')
      .add(
        HttpApiEndpoint.get('UserInfo', `/:envid/as/userinfo`)
          .setPath(Schema.Struct({ envid: Schema.String }))
          .addSuccess(UserInfoSchema)
          .addError(HttpApiError.Unauthorized)
          .annotate(OpenApi.Summary, 'UserInfo Endpoint')
          .annotate(
            OpenApi.Description,
            'Returns claims about the authenticated end-user. Requires a valid access token.',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware),
  )
  .add(
    HttpApiGroup.make('Revoke')
      .add(
        HttpApiEndpoint.post('RevokeToken', `/:envid/as/revoke`)
          .setPath(RevokePath)
          .setPayload(RevokeRequestBody)
          .addSuccess(RevokeResponseBody)
          .addError(HttpApiError.Unauthorized)
          .annotate(OpenApi.Summary, 'Token Revocation Endpoint')
          .annotate(
            OpenApi.Description,
            'Allows clients to notify the authorization server that a previously obtained refresh or access token is no longer needed',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware), // Applies to token, end session, revoke
  )
  // Middlewares for relevant endpoints
  .annotate(
    OpenApi.Description,
    'All PingAM endpoints for OIDC and OAuth2 flows grouped together.',
  );

export { MockApi };
