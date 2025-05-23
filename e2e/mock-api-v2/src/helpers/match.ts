/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from '@effect/schema';
import { Effect, Match } from 'effect';

import { InvalidUsernamePassword, InvalidProtectNode } from '../errors/index.js';
import { PingOneCustomHtmlRequestBody } from '../schemas/custom-html-template/custom-html-template-request.schema.js';

type PingRequestData = Schema.Schema.Type<
  typeof PingOneCustomHtmlRequestBody
>['parameters']['data']['formData']['value'];
/**
 * Using this to match on the data types, realistically, this will be a schema of possible
 * response bodies we want to validate against they validate to our conditions.
 *
 * We can then return back either an Error to respond with, if validation fails
 * or we can continue to the next step in the flow
 */
const validator = Match.type<PingRequestData>().pipe(
  Match.when({ username: Match.string, password: Match.string }, ({ username, password }) => {
    return Effect.if(username == 'testuser' && password === 'Password', {
      onFalse: () => Effect.fail(new InvalidUsernamePassword()),
      onTrue: () => Effect.succeed(true),
    });
  }),
  Match.when({ pingprotectsdk: Match.string }, ({ pingprotectsdk }) => {
    return Effect.if(pingprotectsdk.length > 1, {
      onTrue: () => Effect.succeed(true),
      onFalse: () => Effect.fail(new InvalidProtectNode()),
    });
  }),
  Match.exhaustive,
);
export { validator, PingRequestData };
