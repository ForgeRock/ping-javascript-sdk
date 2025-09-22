/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Micro } from 'effect';
import { oidcApi } from './oidc.api.js';
import { createClientStore, createLogoutError } from './client.store.utils.js';
import type { OauthTokens, OidcConfig } from './config.types.js';
import type { WellKnownResponse } from '@forgerock/sdk-types';
import type { StorageClient } from '@forgerock/storage';
import type { LogoutErrorResult, LogoutSuccessResult } from './client.types.js';

export function logoutµ({
  tokens,
  config,
  wellknown,
  store,
  storageClient,
}: {
  tokens: OauthTokens;
  config: OidcConfig;
  wellknown: WellKnownResponse;
  store: ReturnType<typeof createClientStore>;
  storageClient: StorageClient<OauthTokens>;
}) {
  return Micro.zip(
    // End session with the ID token
    Micro.promise(() =>
      store.dispatch(
        oidcApi.endpoints.endSession.initiate({
          idToken: tokens.idToken,
          endpoint: wellknown.ping_end_idp_session_endpoint || wellknown.end_session_endpoint,
        }),
      ),
    ).pipe(Micro.map(({ data, error }) => createLogoutError(data, error))),

    // Revoke the access token
    Micro.promise(() =>
      store.dispatch(
        oidcApi.endpoints.revoke.initiate({
          accessToken: tokens.accessToken,
          clientId: config.clientId,
          endpoint: wellknown.revocation_endpoint,
        }),
      ),
    ).pipe(Micro.map(({ data, error }) => createLogoutError(data, error))),
  ).pipe(
    // Delete local token and return combined results
    Micro.flatMap(([sessionResponse, revokeResponse]) =>
      Micro.promise(() => storageClient.remove()).pipe(
        Micro.flatMap((deleteResponse) => {
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
            return Micro.fail(result);
          } else {
            const result: LogoutSuccessResult = {
              sessionResponse: null,
              revokeResponse: null,
              deleteResponse: null,
            };
            return Micro.succeed(result);
          }
        }),
      ),
    ),
  );
}
