import { HttpApiError, HttpApiMiddleware, HttpServerRequest } from '@effect/platform';
import { SessionData, SessionStorage } from '../services/session.service.js';
import { Context, Effect, Layer } from 'effect';

class Session extends Context.Tag('Session')<Session, SessionData>() {}

export class SessionMiddleware extends HttpApiMiddleware.Tag<SessionMiddleware>()('Session', {
  failure: HttpApiError.Unauthorized,
  provides: Session,
}) {}

export const SessionMiddlewareMock = Layer.effect(
  SessionMiddleware,
  Effect.gen(function* () {
    const sessionStorage = yield* SessionStorage;

    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const sessionData = yield* sessionStorage
        .getSession(request.cookies.sessionId)
        .pipe(Effect.orDie);
      if (!sessionData) {
        const session = yield* sessionStorage.createSession({
          userId: request.cookies.userId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          data: {},
        });

        return session;
      }

      yield* sessionStorage
        .refreshSession(request.cookies.sessionId, sessionData.expiresAt)
        .pipe(Effect.orDie);

      return sessionData;
    });
  }),
);
