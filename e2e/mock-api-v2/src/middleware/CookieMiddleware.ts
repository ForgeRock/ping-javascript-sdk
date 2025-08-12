/**
 * Copyright (c) 2025 Ping Identity Corporation.
 * MIT License
 */
import {
  HttpApiMiddleware,
  HttpApp,
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { ResponseError } from '@effect/platform/HttpServerError';
import { Console, Effect, Layer } from 'effect';

// Export the tag so you can .middleware(IncrementStepIndex) in your spec if desired
export class IncrementStepIndex extends HttpApiMiddleware.Tag<IncrementStepIndex>()(
  'IncrementStepIndex',
) {}

export const IncrementStepIndexMock = Layer.effect(
  IncrementStepIndex,
  Effect.gen(function* () {
    yield* Console.log('IncrementStepIndex: init');

    return Effect.gen(function* () {
      // Read cookies from the current request
      const request = yield* HttpServerRequest.HttpServerRequest;

      // Parse existing stepIndex cookie or default to 0
      const cookies = request.cookies;
      const currentStepIndex = cookies.stepIndex ? parseInt(cookies.stepIndex, 10) : 0;

      // Normalize URL (strip query) and detect special flows
      const urlPath = request.url.split('?')[0] ?? '';
      const isEndSessionRequest =
        urlPath.includes('/endSession') || urlPath.includes('/end_session');
      const isAuthFlowRequest = urlPath.includes('/authorize') || urlPath.includes('/authenticate');

      // Decide next value
      let newStepIndex = currentStepIndex;
      if (isEndSessionRequest) {
        newStepIndex = 0;
        yield* Console.log(
          `IncrementStepIndex: end-session detected → resetting stepIndex to ${newStepIndex}`,
        );
      } else if (isAuthFlowRequest) {
        newStepIndex = currentStepIndex + 1;
        yield* Console.log(
          `IncrementStepIndex: auth flow → ${currentStepIndex} -> ${newStepIndex}`,
        );
      } else {
        yield* Console.log(
          `IncrementStepIndex: other route ${urlPath} → keeping stepIndex ${currentStepIndex}`,
        );
      }

      // Write cookie just before the response is sent
      yield* HttpApp.appendPreResponseHandler((req, res) =>
        HttpServerResponse.setCookie(res, 'stepIndex', String(newStepIndex), {
          // NOTE: mock defaults; tighten in prod (httpOnly: true, secure: true, sameSite: 'lax')
          httpOnly: false,
          secure: false,
          sameSite: 'strict',
          path: '/',
        }).pipe(
          // If cookie setting fails, convert to a typed ResponseError for consistent diagnostics
          Effect.catchTag(
            'CookieError',
            () =>
              new ResponseError({
                request: req,
                response: res,
                reason: 'Decode',
                cause: 'error updating the stepIndex cookie',
              }),
          ),
        ),
      );
    });
  }),
);
