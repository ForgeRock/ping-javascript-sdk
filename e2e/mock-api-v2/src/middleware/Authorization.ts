import { HttpApiError, HttpApiMiddleware, HttpApiSecurity, OpenApi } from 'effect/unstable/httpapi';
import type { HttpServerResponse } from 'effect/unstable/http/HttpServerResponse';
import { Brand, Context, Effect, Layer, Redacted, Types } from 'effect';

type BearerTokenValue = string & Brand.Brand<'BearerToken'>;
const BearerTokenValue = Brand.nominal<BearerTokenValue>();

// Define a service that holds the bearer token
class BearerToken extends Context.Service<BearerToken, BearerTokenValue>()('BearerToken') {}

class Authorization extends HttpApiMiddleware.Service<
  Authorization,
  { provides: typeof BearerToken }
>()('Authorization', {
  error: HttpApiError.Unauthorized,
  security: {
    myBearer: HttpApiSecurity.bearer.pipe(
      HttpApiSecurity.annotate(OpenApi.Description, 'Bearer token for API authentication'),
    ),
  },
}) {}

const AuthorizationMock = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    yield* Effect.log('creating Authorization middleware');

    return {
      myBearer: (
        httpEffect: Effect.Effect<HttpServerResponse, Types.unhandled, typeof BearerToken>,
        {
          credential,
        }: { credential: Redacted.Redacted<string>; endpoint: unknown; group: unknown },
      ) =>
        Effect.gen(function* () {
          const tokenValue = Redacted.value(credential);
          yield* Effect.log('checking bearer token', tokenValue);

          // Validation logic
          // 1. Check if token is empty
          // 2. Check if token has been revoked (has REVOKED_ prefix)
          if (!tokenValue || tokenValue.trim() === '' || tokenValue.startsWith('REVOKED_')) {
            return yield* Effect.fail(new HttpApiError.Unauthorized());
          }

          // Provide BearerToken and run the original effect
          return yield* httpEffect.pipe(
            Effect.provideService(BearerToken, BearerTokenValue(tokenValue)),
          );
        }),
    };
  }),
);

export { Authorization, AuthorizationMock, BearerToken };
