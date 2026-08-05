/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';
import { oidcApi } from './oidc.api.js';
import { createLogoutError } from './client.store.utils.js';

import type { OauthTokens, OidcConfig } from './config.types.js';
import type { WellknownResponse } from '@forgerock/sdk-types';
import type { StorageClient } from '@forgerock/storage';
import type { ClientStore, LogoutErrorResult, LogoutSuccessResult } from './client.types.js';

export function logoutµ({
  tokens,
  config,
  wellknown,
  store,
  storageClient,
}: {
  tokens: OauthTokens;
  config: OidcConfig;
  wellknown: WellknownResponse;
  store: ClientStore;
  storageClient: StorageClient<OauthTokens>;
}) {
  return Effect.zip(
    // End session with the ID token
    Effect.promise(() =>
      store.dispatch(
        oidcApi.endpoints.endSession.initiate({
          idToken: tokens.idToken,
          endpoint: wellknown.ping_end_idp_session_endpoint || wellknown.end_session_endpoint,
          signOutRedirectUri: config.signOutRedirectUri,
        }),
      ),
    ).pipe(Effect.map(({ data, error }) => createLogoutError(data, error))),

    // Revoke the access token
    Effect.promise(() =>
      store.dispatch(
        oidcApi.endpoints.revoke.initiate({
          accessToken: tokens.accessToken,
          clientId: config.clientId,
          endpoint: wellknown.revocation_endpoint,
        }),
      ),
    ).pipe(Effect.map(({ data, error }) => createLogoutError(data, error))),
  ).pipe(
    // Delete local token and return combined results
    Effect.flatMap(([sessionResponse, revokeResponse]) =>
      Effect.promise(() => storageClient.remove()).pipe(
        Effect.flatMap((deleteResponse) => {
          const isInnerRequestError =
            (sessionResponse && 'error' in sessionResponse) ||
            (revokeResponse && 'error' in revokeResponse) ||
            (deleteResponse && 'error' in deleteResponse);

          if (isInnerRequestError) {
            const result: LogoutErrorResult = {
              error: 'Inner request error',
              sessionResponse,
              revokeResponse,
              deleteResponse,
            };
            return Effect.fail(result);
          } else {
            const result: LogoutSuccessResult = {
              sessionResponse: null,
              revokeResponse: null,
              deleteResponse: null,
            };
            return Effect.succeed(result);
          }
        }),
      ),
    ),
  );
}
