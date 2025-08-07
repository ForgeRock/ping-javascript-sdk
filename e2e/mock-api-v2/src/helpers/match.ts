/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, Match, Schema } from 'effect';

import { HttpApiError } from '@effect/platform';
import { CapabilitiesRequestBody } from '../schemas/capabilities/capabilities.request.schema.js';

type PingRequestData = Schema.Schema.Type<typeof CapabilitiesRequestBody>;
/**
 * Using this to match on the data types, realistically, this will be a schema of possible
 * response bodies we want to validate against they validate to our conditions.
 *
 * We can then return back either an Error to respond with, if validation fails
 * or we can continue to the next step in the flow
 */
const validator = Match.type<PingRequestData>().pipe(
  Match.when(
    { parameters: { data: { formData: { username: Match.string, password: Match.string } } } },
    ({ parameters }) =>
      Effect.if(
        parameters.data.formData.username == 'testuser' &&
          parameters.data.formData.password === 'Password',
        {
          onFalse: () => Effect.fail(new HttpApiError.Unauthorized()),
          onTrue: () => Effect.succeed(true),
        },
      ),
  ),
  Match.orElse(() => Effect.succeed(true)),
);

export { validator, PingRequestData };
