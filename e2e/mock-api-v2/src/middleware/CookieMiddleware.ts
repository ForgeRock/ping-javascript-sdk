import {
  HttpServerResponse,
  HttpApiMiddleware,
  HttpApp,
  HttpServerRequest,
} from '@effect/platform';
import { ResponseError } from '@effect/platform/HttpServerError';
import { Console, Effect, Layer } from 'effect';

class IncrementStepIndex extends HttpApiMiddleware.Tag<IncrementStepIndex>()(
  'IncrementStepIndex',
) {}
const IncrementStepIndexMock = Layer.effect(
  IncrementStepIndex,
  Effect.gen(function* () {
    yield* Console.log('In middleware');

    return Effect.gen(function* () {
      // Get the current request to read cookies
      const request = yield* HttpServerRequest.HttpServerRequest;

      // Parse existing stepIndex cookie or default to 0
      const cookies = request.cookies;
      const currentStepIndex = cookies.stepIndex ? parseInt(cookies.stepIndex) : 0;
      const newStepIndex = currentStepIndex + 1;

      yield* Console.log(`Current stepIndex: ${currentStepIndex}, setting to: ${newStepIndex}`);

      // Set the incremented stepIndex cookie in the response
      yield* HttpApp.appendPreResponseHandler((request, response) =>
        HttpServerResponse.setCookie(response, 'stepIndex', String(newStepIndex), {
          // Optional cookie options
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
        }).pipe(
          Effect.catchTag(
            'CookieError',
            () =>
              new ResponseError({
                request,
                response,
                reason: 'Decode',
                cause: 'error updating the stepIndex cookie',
              }),
          ),
        ),
      );
    });
  }),
);

export { IncrementStepIndexMock };
