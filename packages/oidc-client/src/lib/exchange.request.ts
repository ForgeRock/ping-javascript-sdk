/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Micro } from 'effect';

import { logger } from '@forgerock/sdk-logger';

import { createValuesµ, handleTokenResponseµ, validateValuesµ } from './exchange.utils.js';
import { oidcApi } from './oidc.api.js';
import { createClientStore } from './client.store.utils.js';

import type { OauthTokens, OidcConfig } from './config.types.js';
import type { StorageConfig } from 'node_modules/@forgerock/storage/src/lib/storage.effects.js';
import { TokenExchangeErrorResponse } from './exchange.types.js';

interface BuildTokenExchangeµParams {
  code: string;
  config: OidcConfig;
  endpoint: string;
  log: ReturnType<typeof logger>;
  state: string;
  store: ReturnType<typeof createClientStore>;
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
}: BuildTokenExchangeµParams): Micro.Micro<OauthTokens, TokenExchangeErrorResponse, never> {
  return createValuesµ(code, config, state, endpoint, options).pipe(
    Micro.flatMap((options) => validateValuesµ(options)),
    Micro.tap((options) => log.debug('Token exchange values created', options)),
    Micro.tapError((options) =>
      Micro.sync(() => log.error('Error creating token exchange values', options)),
    ),
    Micro.flatMap((requestOptions) =>
      Micro.promise(() => store.dispatch(oidcApi.endpoints.exchange.initiate(requestOptions))),
    ),
    Micro.flatMap(({ data, error }) => handleTokenResponseµ(data, error)),
    Micro.tap((data) => log.debug('Token exchange response handled', data)),
    Micro.tapError((error) =>
      Micro.sync(() => log.error('Error handling token exchange response', error)),
    ),
    Micro.map((data) => {
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
