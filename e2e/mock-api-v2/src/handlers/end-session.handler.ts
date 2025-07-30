/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, Console } from 'effect';
import { HttpApiBuilder, HttpServerRequest } from '@effect/platform';
import { MockApi } from '../spec.js';
import { SessionStorage } from '../services/session.service.js';

export const EndSessionHandlerMock = HttpApiBuilder.group(
  MockApi,
  'SessionManagement',
  (handlers) =>
    handlers.handle('EndSession', () =>
      Effect.gen(function* () {
        const sessionStorage = yield* SessionStorage;

        const request = yield* HttpServerRequest.HttpServerRequest;

        const sessionId = request.cookies.sessionId;

        if (sessionId) {
          yield* sessionStorage.deleteSession(sessionId);
        } else {
          yield* Console.log('No active session');
        }

        const urlParams = request.url.includes('?')
          ? new URLSearchParams(request.url.split('?')[1])
          : new URLSearchParams();

        const redirectUri = urlParams.get('post_logout_redirect_uri');
        const state = urlParams.get('state');

        if (redirectUri) {
          // For a full OIDC-compliant implementation, we would validate:
          // 1. If id_token_hint is provided, validate it
          // 2. Verify that redirectUri is registered for this client

          // Create a proper HTTP redirect (302 Found) response
          const targetUrl = state
            ? `${redirectUri}?state=${encodeURIComponent(state)}`
            : redirectUri;

          return {
            status: 302,
            headers: {
              Location: targetUrl,
              'Cache-Control': 'no-store',
            },
            body: '',
          };
        }

        // Default response if no redirect
        return 'Logged out successfully';
      }).pipe(Effect.withSpan('EndSessionHandler')),
    ),
);
