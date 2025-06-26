/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Context, Effect, Layer, Schema } from 'effect';
import { HttpApiError } from '@effect/platform';
import { tokenResponseBody } from '../responses/token/token.js';
import { TokenResponseBody } from '../schemas/token/token.schema.js';

import { HeaderTypes } from '../types/index.js';

type TokensResponseBody = Schema.Schema.Type<typeof TokenResponseBody>;

class Tokens extends Context.Tag('@services/Tokens')<
  Tokens,
  {
    getTokens: <Headers extends HeaderTypes>(
      headers: Headers,
    ) => Effect.Effect<TokensResponseBody, HttpApiError.Unauthorized, never>;
  }
>() {}

const TokensMock = Layer.succeed(
  Tokens,
  Tokens.of({
    getTokens: () =>
      Effect.gen(function* () {
        const response = yield* Effect.tryPromise({
          try: () => Promise.resolve(tokenResponseBody),
          catch: () => new HttpApiError.Unauthorized(),
        });
        return response;
      }),
  }),
);

export { TokensMock, Tokens };
