/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { MockApi } from '../spec.js';
import { Tokens } from '../services/tokens.service.js';
import { HttpApiBuilder } from '@effect/platform';
import { Effect } from 'effect';

const RevokeTokenHandler = HttpApiBuilder.group(MockApi, 'Revoke', (handlers) =>
  handlers.handle('RevokeToken', () =>
    Effect.gen(function* () {
      const { revokeToken } = yield* Tokens;

      // For simplicity in the mock API, we'll use a default token
      // A real implementation would parse the x-www-form-urlencoded body
      const token = 'example-token';
      const tokenTypeHint = undefined;

      yield* Effect.log('Revoking token', { token, tokenTypeHint });

      const result = yield* revokeToken(token, tokenTypeHint);

      return result;
    }).pipe(Effect.withSpan('RevokeTokenHandler')),
  ),
);

export { RevokeTokenHandler };
