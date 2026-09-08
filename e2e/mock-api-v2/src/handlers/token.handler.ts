/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { HttpApiBuilder } from '@effect/platform';
import { Effect } from 'effect';

import { Tokens } from '../services/tokens.service.js';
import { MockApi } from '../spec.js';

const TokensHandler = HttpApiBuilder.group(MockApi, 'Tokens', (handlers) =>
  handlers.handle('Tokens', () =>
    Effect.gen(function* () {
      const { getTokens } = yield* Tokens;
      const tokens = yield* getTokens(null);

      return tokens;
    }).pipe(Effect.withSpan('TokensHandler')),
  ),
);

export { TokensHandler };
