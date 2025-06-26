import { Unauthorized } from '@effect/platform/HttpApiError';
import { HttpApiMiddleware, HttpApiSecurity } from '@effect/platform';
import { Brand, Context, Effect, Layer, Redacted } from 'effect';

type BearerTokenValue = string & Brand.Brand<'BearerToken'>;
const BearerTokenValue = Brand.nominal<BearerTokenValue>();

// Define a service that holds the bearer token
class BearerToken extends Context.Tag('BearerToken')<BearerToken, BearerTokenValue>() {}

class Authorization extends HttpApiMiddleware.Tag<Authorization>()('Authorization', {
  failure: Unauthorized,
  provides: BearerToken, // Declare that this middleware provides the bearer token
  security: {
    myBearer: HttpApiSecurity.bearer,
  },
}) {}

const AuthorizationMock = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    yield* Effect.log('creating Authorization middleware');

    return {
      myBearer: (bearerToken) =>
        Effect.gen(function* () {
          const tokenValue = Redacted.value(bearerToken);
          yield* Effect.log('checking bearer token', tokenValue);

          // Here you could add validation logic if needed
          // For now, we just pass through any token
          if (!tokenValue || tokenValue.trim() === '') {
            return yield* Effect.fail(new Unauthorized());
          }

          // Return the token value so routes can access it
          return BearerTokenValue(tokenValue);
        }),
    };
  }),
);

export { Authorization, AuthorizationMock, BearerToken };
