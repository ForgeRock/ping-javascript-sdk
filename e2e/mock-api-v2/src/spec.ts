/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from '@effect/platform';
import { openIdConfigurationResponseSchema } from './schemas/open-id-configuration/open-id-configuration-response.schema.js';
import {
  AuthorizePath,
  DavinciAuthorizeHeaders,
  DavinciAuthorizeQuery,
} from './schemas/authorize.schema.js';
import { PingOneCustomHtmlResponseBody } from './schemas/custom-html-template/custom-html-template-response.schema.js';
import { TokenResponseBody } from './schemas/token/token.schema.js';
import { UserInfoSchema } from './schemas/userinfo/userinfo.schema.js';
import { Authorization } from './middleware/Authorization.js';
import { SessionMiddleware } from './middleware/Session.js';
import {
  EndSessionPath,
  EndSessionQuery,
  EndSessionHeaders,
} from './schemas/end-session.schema.js';
import {
  RevokePath,
  RevokeRequestBody,
  RevokeResponseBody,
} from './schemas/revoke/revoke.schema.js';

const MockApi = HttpApi.make('MyApi')
  .annotate(OpenApi.Title, 'PingOne OIDC Mock API')
  .annotate(OpenApi.Version, '1.0.0')
  .annotate(
    OpenApi.Description,
    'Mock API for PingOne OIDC flows including authorization, token issuance, token validation, token revocation, and end session. This API implements a simplified version of the OpenID Connect and OAuth 2.0 protocols for testing purposes.',
  )
  .annotate(OpenApi.License, { name: 'MIT License', url: 'https://opensource.org/licenses/MIT' })
  .annotate(OpenApi.Servers, [
    { url: 'http://localhost:9443', description: 'Local development server' },
  ])
  .add(
    HttpApiGroup.make('Healthcheck')
      .add(
        HttpApiEndpoint.get('HealthCheck')`/healthcheck`
          .addSuccess(Schema.String)
          .annotate(OpenApi.Summary, 'Server Health Check')
          .annotate(
            OpenApi.Description,
            'Returns a simple health status to verify the server is operational',
          ),
      )
      .annotate(OpenApi.Description, 'Server health monitoring endpoints'),
  )
  .add(
    HttpApiGroup.make('OpenIDConfig')
      .add(
        HttpApiEndpoint.get('openid')`/:envid/as/.well-known/openid-configuration`
          .setPath(Schema.Struct({ envid: Schema.String }))
          .addSuccess(openIdConfigurationResponseSchema)
          .annotate(OpenApi.Summary, 'OIDC Configuration')
          .annotate(
            OpenApi.Description,
            'Returns the OpenID Connect configuration for this provider including available endpoints and supported features',
          ),
      )
      .annotate(OpenApi.Description, 'OpenID Connect discovery endpoints'),
  )
  .add(
    HttpApiGroup.make('Authorization')
      .add(
        HttpApiEndpoint.get('DavinciAuthorize')`/:envid/as/authorize`
          .setPath(AuthorizePath)
          .setUrlParams(DavinciAuthorizeQuery)
          .setHeaders(DavinciAuthorizeHeaders)
          .addSuccess(PingOneCustomHtmlResponseBody)
          .addError(HttpApiError.NotFound)
          .annotate(OpenApi.Summary, 'Authorization Endpoint')
          .annotate(
            OpenApi.Description,
            'OIDC authorization endpoint that initiates the authentication flow and returns HTML for login form rendering',
          ),
      )
      .annotate(OpenApi.Description, 'OAuth 2.0/OIDC authorization endpoints'),
  )
  .add(
    HttpApiGroup.make('Tokens')
      .add(
        HttpApiEndpoint.post('Tokens')`/:envid/as/token`
          .addSuccess(TokenResponseBody)
          .addError(HttpApiError.Unauthorized)
          .setPath(Schema.Struct({ envid: Schema.String }))
          .annotate(OpenApi.Summary, 'Token Endpoint')
          .annotate(
            OpenApi.Description,
            'Issues access tokens, ID tokens, and refresh tokens after successful authentication',
          ),
      )
      .middleware(SessionMiddleware)
      .annotate(OpenApi.Description, 'OAuth 2.0/OIDC token issuance endpoints'),
  )
  .add(
    HttpApiGroup.make('Protected Requests')
      .add(
        HttpApiEndpoint.get('UserInfo')`/:envid/as/userinfo`
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
      .annotate(
        OpenApi.Description,
        'Endpoints that require a valid access token for authorization',
      ),
  )
  .add(
    HttpApiGroup.make('SessionManagement')
      .add(
        HttpApiEndpoint.get('EndSession')`/:envid/as/endSession`
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
      .middleware(SessionMiddleware)
      .annotate(OpenApi.Description, 'Endpoints for managing user sessions and logout flows'),
  )
  .add(
    HttpApiGroup.make('TokenRevocation')
      .add(
        HttpApiEndpoint.post('RevokeToken')`/:envid/as/revoke`
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
      .middleware(SessionMiddleware)
      .annotate(OpenApi.Description, 'Endpoints for invalidating tokens and terminating access'),
  );

export { MockApi };
