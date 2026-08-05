/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';

import { logger } from '@forgerock/sdk-logger';

import { createValuesµ, handleTokenResponseµ, validateValuesµ } from './exchange.utils.js';
import { oidcApi } from './oidc.api.js';

import type { ClientStore } from './client.types.js';
import type { OauthTokens, OidcConfig } from './config.types.js';
import type { StorageConfig } from '@forgerock/storage';
import type { TokenExchangeErrorResponse } from './exchange.types.js';

interface BuildTokenExchangeµParams {
  code: string;
  config: OidcConfig;
  endpoint: string;
  log: ReturnType<typeof logger>;
  state: string;
  store: ClientStore;
  options?: Partial<StorageConfig>;
}

export function buildTokenExchangeµ({
  code,
  config,
  endpoint,
  log,
  state,
  store,
  options,
}: BuildTokenExchangeµParams): Effect.Effect<OauthTokens, TokenExchangeErrorResponse, never> {
  return createValuesµ(code, config, state, endpoint, options).pipe(
    Effect.flatMap((options) => validateValuesµ(options)),
    Effect.tap((options) => Effect.sync(() => log.debug('Token exchange values created', options))),
    Effect.tapError((options) =>
      Effect.sync(() => log.error('Error creating token exchange values', options)),
    ),
    Effect.flatMap((requestOptions) =>
      Effect.promise(() => store.dispatch(oidcApi.endpoints.exchange.initiate(requestOptions))),
    ),
    Effect.flatMap(({ data, error }) => handleTokenResponseµ(data, error)),
    Effect.tap((data) => Effect.sync(() => log.debug('Token exchange response handled', data))),
    Effect.tapError((error) =>
      Effect.sync(() => log.error('Error handling token exchange response', error)),
    ),
    Effect.map((data) => {
      const tokens = {
        accessToken: data.access_token,
        idToken: data.id_token,
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
        ...(data.expires_in && { expiresAt: data.expires_in }),
        ...(data.expires_in && { expiryTimestamp: Date.now() + data.expires_in * 1000 }),
      };

      return tokens;
    }),
  );
}
