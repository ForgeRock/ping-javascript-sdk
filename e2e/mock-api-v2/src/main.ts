/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Layer } from 'effect';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { MockApi } from './spec.js';
import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from '@effect/platform';
import { createServer } from 'node:http';
import { HealthCheckLive } from './handlers/healthcheck.handler.js';
import { OpenidConfigMock } from './handlers/open-id-configuration.handler.js';
import { IncrementStepIndexMock } from './middleware/CookieMiddleware.js';
import { AuthorizeHandlerMock } from './handlers/authorize.handler.js';
import { AuthorizeMock } from './services/authorize.service.js';
import { TokensMock } from './services/tokens.service.js';
import { TokensHandler } from './handlers/token.handler.js';
import { UserInfoMockHandler } from './handlers/userinfo.handler.js';
import { UserInfoMockService } from './services/userinfo.service.js';
import { AuthorizationMock } from './middleware/Authorization.js';
import { SessionMiddlewareMock } from './middleware/Session.js';
import { SessionStorage } from './services/session.service.js';
import { NodeSdk } from '@effect/opentelemetry';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { EndSessionHandlerMock } from './handlers/end-session.handler.js';
import { RevokeTokenHandler } from './handlers/revoke.handler.js';

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'Mock-Api' },
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

const APIMock = HttpApiBuilder.api(MockApi).pipe(
  Layer.provide(HealthCheckLive),
  Layer.provide(OpenidConfigMock),
  Layer.provide(AuthorizeHandlerMock),
  Layer.provide(TokensHandler),
  Layer.provide(UserInfoMockHandler),
  Layer.provide(EndSessionHandlerMock),
  Layer.provide(RevokeTokenHandler),
);

const ServerMock = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(APIMock),
  Layer.provide(TokensMock),
  Layer.provide(IncrementStepIndexMock),
  Layer.provide(AuthorizationMock),
  Layer.provide(UserInfoMockService),
  Layer.provide(SessionMiddlewareMock),
  Layer.provide(SessionStorage.Default),
  Layer.provide(AuthorizeMock),
  Layer.provide(NodeSdkLive),
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowedOrigins: ['*'],
      credentials: true,
      maxAge: 3600,
    }),
  ),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 9443 })),
);

Layer.launch(ServerMock).pipe(NodeRuntime.runMain);
