import { Context, Effect, Layer } from 'effect';
import { HttpServerRequest } from 'effect/http';
import { HttpApiError, HttpApiMiddleware } from 'effect/http-api';

import { SessionStorage } from '../services/session.service.js';

import type { HttpServerResponse } from 'effect/http/HttpServerResponse';

import type { SessionData } from '../services/session.service.js';

class Session extends Context.Service<Session, SessionData>()('Session') {}

export class SessionMiddleware extends HttpApiMiddleware.Service<
  SessionMiddleware,
  { provides: typeof Session }
>()('Session', {
  error: HttpApiError.Unauthorized,
}) {}

export const SessionMiddlewareMock = Layer.effect(
  SessionMiddleware,
  Effect.gen(function* () {
    const sessionStorage = yield* SessionStorage;

    return (httpEffect: Effect.Effect<HttpServerResponse, never, typeof Session>) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const sessionData = yield* sessionStorage
          .getSession(request.cookies.sessionId)
          .pipe(Effect.orDie);

        let session: SessionData;
        if (!sessionData) {
          session = yield* sessionStorage
            .createSession({
              userId: request.cookies.userId,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
              data: {},
            })
            .pipe(Effect.orDie);
        } else {
          yield* sessionStorage
            .refreshSession(request.cookies.sessionId, sessionData.expiresAt)
            .pipe(Effect.orDie);
          session = sessionData;
        }

        return yield* httpEffect.pipe(Effect.provideService(Session, session));
      });
  }),
);
