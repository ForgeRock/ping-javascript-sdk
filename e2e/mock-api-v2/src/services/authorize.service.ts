/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Context, Effect, Layer, Schema } from 'effect';
import { HttpApiError } from '@effect/platform';

import { getFirstElementAndRespond } from './mock-env-helpers/index.js';
import { PingOneCustomHtmlResponseBody } from '../schemas/custom-html-template/custom-html-template-response.schema.js';

import { DavinciAuthorizeQuery } from '../schemas/authorize.schema.js';

type AuthorizeResponseBody = Schema.Schema.Type<typeof PingOneCustomHtmlResponseBody>;

class Authorize extends Context.Tag('@services/authorize')<
  Authorize,
  {
    handleAuthorize: (
      query: DavinciAuthorizeQuery,
    ) => Effect.Effect<{ status: 200; body: AuthorizeResponseBody }, HttpApiError.NotFound, never>;
  }
>() {}

const AuthorizeMock = Layer.succeed(
  Authorize,
  Authorize.of({
    handleAuthorize: (query) =>
      Effect.gen(function* () {
        const response = yield* getFirstElementAndRespond(query);

        return response;
      }),
  }),
);

export { Authorize, AuthorizeMock };
