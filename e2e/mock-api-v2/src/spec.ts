/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  OpenApi,
} from 'effect/unstable/httpapi';
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
      HttpApiEndpoint.get('HealthCheck', '/healthcheck', {
        success: Schema.String,
      })
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
      HttpApiEndpoint.get('authorize', `/:envid/davinci/authorize`, {
        params: Schema.Struct({ envid: Schema.String }),
        headers: DavinciAuthorizeHeaders,
        query: DavinciAuthorizeQuery,
        success: CapabilitiesResponse,
        error: [HttpApiError.NotFound, HttpApiError.InternalServerError],
      })
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
          {
            payload: CapabilitiesRequestBody,
            params: CapabilitiesPathParams,
            headers: CapabilitiesHeaders,
            success: CapabilitiesResponse,
            error: [
              HttpApiError.NotFound,
              HttpApiError.Unauthorized,
              HttpApiError.InternalServerError,
            ],
          },
        ),
      )
      .middleware(IncrementStepIndex),
  )
  .add(
    HttpApiGroup.make('OpenIDConfig').add(
      HttpApiEndpoint.get('openid', `/:envid/as/.well-known/openid-configuration`, {
        params: Schema.Struct({ envid: Schema.String }),
        success: openIdConfigurationResponseSchema,
      })
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
        HttpApiEndpoint.post('Tokens', `/:envid/as/token`, {
          params: Schema.Struct({ envid: Schema.String }),
          success: TokenResponseBody,
          error: HttpApiError.Unauthorized,
        })
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
        HttpApiEndpoint.get('UserInfo', `/:envid/as/userinfo`, {
          params: Schema.Struct({ envid: Schema.String }),
          success: UserInfoSchema,
          error: HttpApiError.Unauthorized,
        })
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
        HttpApiEndpoint.get('EndSession', `/:envid/as/endSession`, {
          params: EndSessionPath,
          query: EndSessionQuery,
          headers: EndSessionHeaders,
          success: Schema.Union([
            Schema.String,
            Schema.Struct({
              status: Schema.Number,
              headers: Schema.Record(Schema.String, Schema.String),
              body: Schema.String,
            }),
          ]),
          error: HttpApiError.Unauthorized,
        })
          .annotate(OpenApi.Summary, 'End Session Endpoint')
          .annotate(
            OpenApi.Description,
            'OIDC RP-initiated logout endpoint that terminates the user session and invalidates tokens',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware),
  )
  .add(
    HttpApiGroup.make('Revoke')
      .add(
        HttpApiEndpoint.post('RevokeToken', `/:envid/as/revoke`, {
          params: RevokePath,
          payload: RevokeRequestBody,
          success: RevokeResponseBody,
          error: HttpApiError.Unauthorized,
        })
          .annotate(OpenApi.Summary, 'Token Revocation Endpoint')
          .annotate(
            OpenApi.Description,
            'Allows clients to notify the authorization server that a previously obtained refresh or access token is no longer needed',
          ),
      )
      .middleware(Authorization)
      .middleware(SessionMiddleware),
  )
  // Middlewares for relevant endpoints
  .annotate(
    OpenApi.Description,
    'All PingAM endpoints for OIDC and OAuth2 flows grouped together.',
  );

export { MockApi };
