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
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { responseMap } from '../responses/index.js';
import { validator } from '../helpers/match.js';
import { returnSuccessResponseRedirect } from '../responses/return-success-redirect.js';

const CapabilitiesHandlerMock = HttpApiBuilder.group(MockApi, 'Capabilities', (handlers) =>
  handlers.handle('capabilities', ({ payload }) =>
    Effect.gen(function* () {
      const req = yield* HttpServerRequest.HttpServerRequest;
      console.log('request cookies', req.cookies);
      const acr_value = req.cookies.acr_values ?? '';

      console.log('acr_value', acr_value);
      if (!acr_value) {
        return yield* Effect.fail(new HttpApiError.NotFound());
      }

      /**
       * We need a step index cookie to determine which step of the authentication process we are on.
       * If the cookie is not present, we return a 404 Not Found error.
       */

      const stepIndexCookie = req.cookies['stepIndex'];

      /**
       * If we are here with no step index that means we can't continue through a flow.
       * We should error
       */
      console.log('step index cookie', stepIndexCookie);
      if (!stepIndexCookie) {
        console.log('no step index');
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

      if (stepIndex + 1 === steps.length - 1) {
        /**
         * we need to return a success because we have not failed yet,
         * and we have no more steps to process.
         */
        const body = responseMap[stepIndex];

        return yield* pipe(
          HttpServerResponse.json(body),
          Effect.flatMap((res) => HttpServerResponse.setCookie(res, 'ST', 'MockApiCookie123')),
          Effect.flatMap((res) =>
            HttpServerResponse.setCookie(
              res,
              'interactionId',
              returnSuccessResponseRedirect.interactionId,
              {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
              },
            ),
          ),
          Effect.flatMap((res) =>
            HttpServerResponse.setCookie(
              res,
              'interactionToken',
              returnSuccessResponseRedirect.interactionToken,
              {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
              },
            ),
          ),
          Effect.flatMap((res) => HttpServerResponse.removeCookie(res, 'stepIndex')),
          Effect.flatMap((res) => HttpServerResponse.setStatus(res, 200)),
          Effect.flatMap((res) =>
            HttpServerResponse.setHeader(res, 'Content-Type', 'application/json'),
          ),
          Effect.catchTag('CookieError', () => Effect.fail(new HttpApiError.InternalServerError())),
          Effect.catchTag('HttpBodyError', () =>
            Effect.fail(new HttpApiError.InternalServerError()),
          ),
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
