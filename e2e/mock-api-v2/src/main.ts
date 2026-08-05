/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, Layer } from 'effect';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { MockApi } from './spec.js';
import { HttpApiBuilder, HttpApiSwagger } from 'effect/unstable/httpapi';
import * as HttpMiddleware from 'effect/unstable/http/HttpMiddleware';
import * as HttpRouter from 'effect/unstable/http/HttpRouter';
import * as HttpServer from 'effect/unstable/http/HttpServer';
import type { ServeError } from 'effect/unstable/http/HttpServerError';
import { createServer } from 'node:http';
import { HealthCheckLive } from './handlers/healthcheck.handler.js';
import { OpenidConfigMock } from './handlers/open-id-configuration.handler.js';
import { IncrementStepIndexMock } from './middleware/CookieMiddleware.js';
import { AuthorizeHandlerMock } from './handlers/authorize.handler.js';
import { CapabilitiesHandlerMock } from './handlers/capabilities.handler.js';
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

// Wire SessionStorage into SessionMiddlewareMock
const SessionLayer = Layer.provide(
  SessionMiddlewareMock,
  Layer.effect(SessionStorage, SessionStorage.make),
);

// Merge all group handlers
const HandlersLayer = Layer.mergeAll(
  HealthCheckLive,
  OpenidConfigMock,
  AuthorizeHandlerMock,
  TokensHandler,
  CapabilitiesHandlerMock,
  UserInfoMockHandler,
  EndSessionHandlerMock,
  RevokeTokenHandler,
);

// Merge all services
const ServicesLayer = Layer.mergeAll(
  TokensMock,
  IncrementStepIndexMock,
  AuthorizationMock,
  UserInfoMockService,
  SessionLayer,
);

// Build application routes layer with all handlers and services provided in one step each
const AppLayer = HttpApiBuilder.layer(MockApi).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(ServicesLayer),
);

// Compose app + swagger, then provide the router service
const AppWithSwagger = Layer.merge(AppLayer, HttpApiSwagger.layer(MockApi)).pipe(
  Layer.provide(HttpRouter.layer),
);

const ServerMock = HttpRouter.serve(AppWithSwagger, {
  middleware: (app) =>
    HttpMiddleware.cors({
      allowedMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowedOrigins: ['*'],
      credentials: true,
      maxAge: 3600,
    })(HttpMiddleware.logger(app)),
}).pipe(
  HttpServer.withLogAddress,
  Layer.provide(NodeSdkLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 9443, host: 'localhost' })),
);

// TypeScript cannot fully resolve complex Effect layer generic compositions;
// all requirements ARE satisfied at runtime — NodeHttpServer provides FileSystem, Path, HttpPlatform, Etag.
NodeRuntime.runMain(Layer.launch(ServerMock) as Effect.Effect<never, ServeError, never>);
