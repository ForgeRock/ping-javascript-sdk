/**
 * Copyright (c) 2025 Ping Identity Corporation.
 * MIT License
 */
import { HttpApiMiddleware } from 'effect/unstable/httpapi';
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest';
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse';
import { Console, Effect, Layer } from 'effect';
import type { HttpServerResponse as HttpServerResponseType } from 'effect/unstable/http/HttpServerResponse';

// Export the tag so you can .middleware(IncrementStepIndex) in your spec if desired
export class IncrementStepIndex extends HttpApiMiddleware.Service<IncrementStepIndex>()(
  'IncrementStepIndex',
) {}

export const IncrementStepIndexMock = Layer.effect(
  IncrementStepIndex,
  Effect.gen(function* () {
    yield* Console.log('IncrementStepIndex: init');

    return (httpEffect: Effect.Effect<HttpServerResponseType, never, never>) =>
      Effect.gen(function* () {
        // Read cookies from the current request
        const request = yield* HttpServerRequest.HttpServerRequest;

        // Parse existing stepIndex cookie or default to 0
        const cookies = request.cookies;
        const currentStepIndex = cookies.stepIndex ? parseInt(cookies.stepIndex, 10) : 0;

        // Normalize URL (strip query) and detect special flows
        const urlPath = request.url.split('?')[0] ?? '';
        const isEndSessionRequest =
          urlPath.includes('/endSession') || urlPath.includes('/end_session');
        const isAuthFlowRequest =
          urlPath.includes('/authorize') || urlPath.includes('/authenticate');

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

        // Run the original handler then set the step index cookie on the response
        const response = yield* httpEffect;
        return yield* HttpServerResponse.setCookie(response, 'stepIndex', String(newStepIndex), {
          httpOnly: false,
          secure: false,
          sameSite: 'strict',
          path: '/',
        }).pipe(Effect.orDie);
      });
  }),
);
