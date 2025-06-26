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

const tokenHandler = HttpApiBuilder.group(MockApi, 'Tokens', (handlers) =>
  handlers.handle('Tokens', () =>
    Effect.gen(function* () {
      const { getTokens } = yield* Tokens;
      const tokens = yield* getTokens(null);

      return tokens;
    }),
  ),
);

export { tokenHandler };
