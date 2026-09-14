/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Result } from 'effect';

import { parseToOidcConfig, parseToJourneyConfig, parseToDavinciConfig } from './config.utils.js';
import type { OidcConfig, JourneyClientConfig, DaVinciConfig } from './config.types.js';

function throwOnFail<T>(result: Result.Result<T, { field: string; message: string }[]>): T {
  if (Result.isFailure(result)) {
    const messages = result.failure.map((e) => `${e.field}: ${e.message}`).join(', ');
    throw new Error(`Invalid unified SDK config: ${messages}`);
  }
  return result.success;
}

export const makeOidcConfig = (json: unknown): OidcConfig => throwOnFail(parseToOidcConfig(json));

export const makeJourneyConfig = (json: unknown): JourneyClientConfig =>
  throwOnFail(parseToJourneyConfig(json));

export const makeDavinciConfig = (json: unknown): DaVinciConfig =>
  throwOnFail(parseToDavinciConfig(json));
