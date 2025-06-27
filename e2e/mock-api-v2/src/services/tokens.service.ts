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
import { revokeResponseBody } from '../responses/revoke/revoke.js';
import { RevokeResponseBody } from '../schemas/revoke/revoke.schema.js';

import { HeaderTypes } from '../types/index.js';

type TokensResponseBody = Schema.Schema.Type<typeof TokenResponseBody>;
type RevokeTokenResponseBody = Schema.Schema.Type<typeof RevokeResponseBody>;

class Tokens extends Context.Tag('@services/Tokens')<
  Tokens,
  {
    getTokens: <Headers extends HeaderTypes>(
      headers: Headers,
    ) => Effect.Effect<TokensResponseBody, HttpApiError.Unauthorized, never>;
    revokeToken: (
      token: string,
      tokenTypeHint?: string,
    ) => Effect.Effect<RevokeTokenResponseBody, HttpApiError.Unauthorized, never>;
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
    revokeToken: (token) =>
      Effect.gen(function* () {
        // Apply the REVOKED_ prefix to the token
        // This is a simple way to mark tokens as revoked without maintaining state
        // The Authorization middleware will check for this prefix
        yield* Effect.log('Revoking token', { token, newToken: `REVOKED_${token}` });

        // In a real implementation, we might store the token in a revocation list
        // or update it in a database. For this mock, we'll just return success.
        return revokeResponseBody;
      }),
  }),
);

export { TokensMock, Tokens };
