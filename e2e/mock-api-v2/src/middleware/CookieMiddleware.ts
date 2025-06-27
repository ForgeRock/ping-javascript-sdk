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

      // Get the request URL path
      const urlPath = request.url.split('?')[0];
      // Check if this is an end-session request
      const isEndSessionRequest = urlPath.includes('/end_session');
      // Determine the new stepIndex based on the request type
      let newStepIndex = currentStepIndex;
      if (isEndSessionRequest) {
        // Reset the stepIndex for end_session requests
        newStepIndex = 0;
        yield* Console.log('End session request detected, resetting stepIndex to: ' + newStepIndex);
      } else if (urlPath.includes('/authorize') || urlPath.includes('/authenticate')) {
        // Increment the stepIndex for authorization flow requests
        newStepIndex = currentStepIndex + 1;
        yield* Console.log(
          'Current stepIndex: ' + currentStepIndex + ', incrementing to: ' + newStepIndex,
        );
      } else {
        // For other requests, keep the stepIndex the same
        yield* Console.log('Request to ' + urlPath + ', keeping stepIndex at: ' + currentStepIndex);
      }

      // Set the appropriate stepIndex cookie in the response
      yield* HttpApp.appendPreResponseHandler((request, response) =>
        HttpServerResponse.setCookie(response, 'stepIndex', String(newStepIndex), {
          // Optional cookie options
          httpOnly: false,
          secure: false,
          sameSite: 'strict',
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
