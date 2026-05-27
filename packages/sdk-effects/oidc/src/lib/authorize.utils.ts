/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

/**
 * Builds URLSearchParams for an OAuth2/OIDC authorization request.
 * Used for both direct authorize URL construction and PAR body.
 *
 * Standard OAuth fields always take precedence over any conflicting `query`
 * entries — `query` is applied first and then overwritten by the known params.
 */
export function buildAuthorizeParams(
  options: GetAuthorizationUrlOptions & { challenge: string; state: string },
): URLSearchParams {
  const params = new URLSearchParams(options.query);

  params.set('client_id', options.clientId);
  params.set('response_type', options.responseType);
  params.set('scope', options.scope);
  params.set('redirect_uri', options.redirectUri);
  params.set('code_challenge', options.challenge);
  params.set('code_challenge_method', 'S256');
  params.set('state', options.state);

  if (options.responseMode) params.set('response_mode', options.responseMode);
  if (options.prompt) params.set('prompt', options.prompt);

  return params;
}
