/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as Either from 'effect/Either';

import { parseToOidcConfig, parseToJourneyConfig, parseToDavinciConfig } from './config.utils.js';
import type { OidcConfig, JourneyClientConfig, DaVinciConfig } from './config.types.js';

function throwOnLeft<T>(result: Either.Either<T, { field: string; message: string }[]>): T {
  if (Either.isLeft(result)) {
    const messages = result.left.map((e) => `${e.field}: ${e.message}`).join(', ');
    throw new Error(`Invalid unified SDK config: ${messages}`);
  }
  return result.right;
}

export const makeOidcConfig = (json: unknown): OidcConfig => throwOnLeft(parseToOidcConfig(json));

export const makeJourneyConfig = (json: unknown): JourneyClientConfig =>
  throwOnLeft(parseToJourneyConfig(json));

export const makeDavinciConfig = (json: unknown): DaVinciConfig =>
  throwOnLeft(parseToDavinciConfig(json));
