/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Micro } from 'effect';

import {
  buildParBodyµ,
  buildParSlimUrlµ,
  createAuthorizeUrlµ,
  dispatchAuthorizeFetchµ,
  dispatchAuthorizeIframeµ,
  dispatchParRequestµ,
  generateAuthValuesµ,
  generatePkceChallengeµ,
  storeAuthOptionsµ,
  validateParResponseµ,
} from './authorize.request.micros.js';
import { buildAuthorizeOptions } from './authorize.request.utils.js';

import type { CustomLogger } from '@forgerock/sdk-logger';
import type { GetAuthorizationUrlOptions, WellknownResponse } from '@forgerock/sdk-types';

import type {
  AuthorizationError,
  AuthorizationSuccess,
  OptionalAuthorizeOptions,
} from './authorize.request.types.js';
import type { ClientStore } from './client.types.js';
import type { OidcConfig } from './config.types.js';

// ─── Dispatch routing ─────────────────────────────────────────────────────────

/**
 * Routes the authorize URL to the appropriate transport: a direct fetch for
 * pi.flow (PingOne servers reject iframes via X-Frame-Options: DENY), or an
 * iframe for all other response modes.
 */
function dispatchAuthorizeµ(
  url: string,
  options: GetAuthorizationUrlOptions,
  wellknown: WellknownResponse,
  store: ClientStore,
  log: CustomLogger,
): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> {
  if (options.responseMode === 'pi.flow') {
    const { responseMode: _, ...redirectOptions } = options;
    return dispatchAuthorizeFetchµ(store, url, wellknown, redirectOptions).pipe(
      Micro.tap(() => log.debug('Received success response from authorize fetch endpoint')),
    );
  }

  return dispatchAuthorizeIframeµ(store, url, wellknown, options).pipe(
    Micro.tap(() => log.debug('Received success response from authorize iframe endpoint')),
  );
}

// ─── PAR flow ─────────────────────────────────────────────────────────────────

/**
 * @function createParAuthorizeUrlµ
 * @description Pushed Authorization Request (RFC 9126): POSTs all authorize
 *   parameters to the PAR endpoint, then returns a slim URL containing only
 *   `client_id` and `request_uri` — keeping sensitive params out of the
 *   browser address bar.
 * @param wellknown - The well-known configuration; provides the PAR endpoint
 *   and the authorization endpoint origin used to build the slim URL.
 * @param config - The OIDC client configuration.
 * @param log - CustomLogger; used to warn on short PAR `expires_in` windows.
 * @param store - The RTK client store exposing `oidcApi.endpoints.par`.
 * @param options - Optional request-level overrides; `prompt` is split out
 *   so it appears on the slim URL while the rest of the params go in the
 *   PAR POST body.
 * @returns A `Micro` that resolves to the slim authorize URL string or
 *   fails with a typed `AuthorizationError`.
 */
export function createParAuthorizeUrlµ(
  wellknown: WellknownResponse,
  config: OidcConfig,
  log: CustomLogger,
  store: ClientStore,
  options?: OptionalAuthorizeOptions,
): Micro.Micro<string, AuthorizationError, never> {
  const parEndpoint = wellknown.pushed_authorization_request_endpoint;

  if (!parEndpoint) {
    return Micro.fail({
      error: 'PAR_NOT_CONFIGURED',
      error_description: 'PAR endpoint not found in server configuration',
      type: 'wellknown_error',
    } as const);
  }

  const { prompt, ...parBodyOptions } = options ?? {};

  return Micro.gen(function* () {
    const [authUrlOptions, storeOptions] = yield* generateAuthValuesµ(config, wellknown, options);
    const challenge = yield* generatePkceChallengeµ(authUrlOptions.verifier);
    const body = yield* buildParBodyµ(
      config,
      parBodyOptions,
      challenge,
      authUrlOptions.state,
      prompt,
    );
    const parResult = yield* dispatchParRequestµ(store, parEndpoint, body);
    const { request_uri, expires_in } = yield* validateParResponseµ(parResult);
    if (expires_in < 30) {
      yield* Micro.sync(() =>
        log.warn(
          `PAR request_uri expires in ${expires_in}s — authorize must complete before expiry`,
        ),
      );
    }
    yield* storeAuthOptionsµ(storeOptions);
    return yield* buildParSlimUrlµ(
      wellknown.authorization_endpoint,
      config.clientId,
      request_uri,
      prompt,
    );
  });
}

// ─── Standard + PAR authorize ─────────────────────────────────────────────────

/**
 * @function authorizeµ
 * @description Builds an authorization URL and dispatches the authorize
 *   request, transparently using PAR (RFC 9126) when the server mandates it
 *   via `require_pushed_authorization_requests` or when the consumer opts in
 *   with `config.par`. Otherwise builds a full authorize URL and dispatches
 *   via direct fetch (pi.flow) or iframe.
 * @param wellknown - The well-known configuration for the OIDC server,
 *   including `authorization_endpoint` and (optionally) the PAR endpoint.
 * @param config - The OIDC client configuration (clientId, redirectUri,
 *   scope, responseType, and the optional `par` opt-in flag).
 * @param log - The CustomLogger used for debug and error trace.
 * @param store - The RTK client store providing the `oidcApi` endpoints.
 * @param options - Optional request-level overrides for the authorize call.
 * @param useParFlow - Boolean resolved by the caller (e.g. `client.store`)
 *   indicating whether to use the PAR flow. The caller owns the derivation
 *   logic (`config.par ?? require_pushed_authorization_requests === true`);
 *   this function simply routes on the resolved value.
 * @returns A `Micro` that resolves to an `AuthorizationSuccess` containing
 *   the `code` and `state`, or fails with a typed `AuthorizationError`.
 */
export function authorizeµ(
  wellknown: WellknownResponse,
  config: OidcConfig,
  log: CustomLogger,
  store: ClientStore,
  options: GetAuthorizationUrlOptions | undefined,
  useParFlow: boolean,
): Micro.Micro<AuthorizationSuccess, AuthorizationError, never> {
  const parDispatchOptions: GetAuthorizationUrlOptions = {
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: config.scope || 'openid',
    responseType: config.responseType || 'code',
    ...options,
  };

  const parFlow = createParAuthorizeUrlµ(wellknown, config, log, store, options).pipe(
    Micro.tap((url) => log.debug('PAR authorize URL created', url)),
    Micro.tapError((err) =>
      Micro.sync(() => log.error(`PAR authorize failed [${err.type}]: ${err.error}`, err)),
    ),
    Micro.flatMap((url) =>
      dispatchAuthorizeµ(url, parDispatchOptions, wellknown, store, log).pipe(
        Micro.tapError((err) =>
          Micro.sync(() => log.error('Error dispatching PAR authorize request', err)),
        ),
      ),
    ),
  );

  const [path, opts] = buildAuthorizeOptions(wellknown, config, options);
  const standardFlow = createAuthorizeUrlµ(path, opts).pipe(
    Micro.tap(([url]) => log.debug('Authorize URL created', url)),
    Micro.tapError((err) => Micro.sync(() => log.error('Error creating authorize URL', err))),
    Micro.flatMap(([url, dispatchOpts]) =>
      dispatchAuthorizeµ(url, dispatchOpts, wellknown, store, log),
    ),
    Micro.tapError((err) =>
      Micro.sync(() => log.error('Error dispatching authorize request', err)),
    ),
  );

  return useParFlow ? parFlow : standardFlow;
}
