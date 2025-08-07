/**
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, pipe } from 'effect';
import { MockApi } from '../spec.js';
import {
  HttpApiBuilder,
  HttpApiError,
  HttpBody,
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { responseMap } from '../responses/index.js';
import { validator } from '../helpers/match.js';
import { returnSuccessResponseRedirect } from '../responses/return-success-redirect.js';

const CapabilitiesHandlerMock = HttpApiBuilder.group(MockApi, 'Capabilities', (handlers) =>
  handlers.handle('capabilities', ({ urlParams, payload }) =>
    Effect.gen(function* () {
      /**
       * We expect an acr_value query parameter to be present in the request.
       * If it is not present, we return a 404 Not Found error.
       */
      const acr_value = urlParams?.acr_values ?? '';

      if (!acr_value) {
        return yield* Effect.fail(new HttpApiError.NotFound());
      }

      /**
       * We need a step index cookie to determine which step of the authentication process we are on.
       * If the cookie is not present, we return a 404 Not Found error.
       */

      const req = yield* HttpServerRequest.HttpServerRequest;

      const stepIndexCookie = req.cookies['stepIndex'];

      /**
       * If we are here with no step index that means we can't continue through a flow.
       * We should error
       */
      if (!stepIndexCookie) {
        return yield* Effect.fail(new HttpApiError.NotFound());
      }

      const stepIndex = parseInt(stepIndexCookie);

      /**
       * If we have no step index, we should error or if its an invalid number
       */

      if (isNaN(stepIndex) || stepIndex < 0) {
        return yield* Effect.fail(new HttpApiError.NotFound());
      }

      /**
       * Match the body against validators now
       * if the body has no match, we are defaulting to a successful response.
       */
      const result = yield* validator(payload);

      if (result === false) {
        return yield* Effect.fail(new HttpApiError.Unauthorized());
      }

      /**
       * We use the step index to find the next step in the response map.
       * If the step index is out of bounds, we return a 404 Not Found error.
       */
      const steps = responseMap[acr_value];

      /**
       * This may not be the best way to write this.
       * An alternative option would be for us to include the success response we want to return,
       * in the response map.
       *
       * then we can check if we are at the last step. if we are we write the cookie
       * and then we return the success response (last item in array)
       *
       * for now, this returns a default success response and writes cookies.
       */
      if (stepIndex + 1 >= steps.length) {
        /**
         * we need to return a success because we have not failed yet,
         * and we have no more steps to process.
         */
        const body = yield* HttpBody.json(returnSuccessResponseRedirect).pipe(
          /**
           * Decide on a better way to handle this error possibiltiy
           */
          Effect.catchTag('HttpBodyError', () =>
            Effect.fail(
              new HttpApiError.HttpApiDecodeError({
                message: 'Failed to encode body',
                issues: [],
              }),
            ),
          ),
        );
        return pipe(
          HttpServerResponse.json(body),
          HttpServerResponse.setCookie('ST', 'MockApiCookie123'),
          HttpServerResponse.setCookie(
            'interactionId',
            returnSuccessResponseRedirect.interactionId,
            {
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
            },
          ),
          HttpServerResponse.setCookie(
            'interactionToken',
            returnSuccessResponseRedirect.interactionToken,
            {
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
            },
          ),
          HttpServerResponse.removeCookie('stepIndex'),
          HttpServerResponse.setStatus(200),
          HttpServerResponse.setHeader('Content-Type', 'application/json'),
        );
      }

      /**
       * The stepIndex middleware is used to auto-increment the step index
       * based on the request type. If the step index is out of bounds,
       * we return a 404 Not Found error. so we won't increment it, but we check for the next step
       * in the flow.
       */
      const nextStep = steps[stepIndex + 1];

      return nextStep;
    }).pipe(Effect.withSpan('Capabilities Handler Mock')),
  ),
);

export { CapabilitiesHandlerMock };
