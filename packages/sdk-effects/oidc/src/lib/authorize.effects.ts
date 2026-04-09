/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Import the PKCE and ResponseType utilities from the JavaScript SDK
 */
import { createChallenge } from '@forgerock/sdk-utilities';

import { generateAuthUrlValues } from './state-pkce.effects.js';

import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

/** Result of creating an authorization URL with PKCE. */
export interface AuthorizeUrlResult {
  /** The fully-formed authorization URL to redirect to. */
  url: string;
  /** The PKCE verifier — caller must persist this for token exchange. */
  verifier: string;
  /** The state parameter — caller must persist this for CSRF validation. */
  state: string;
}

/**
 * Creates an authorization URL with PKCE parameters.
 *
 * Returns the URL along with the verifier and state values. The caller is
 * responsible for persisting verifier/state (in sessionStorage, a cookie,
 * a server-side session, etc.) so they can be provided during token exchange.
 */
export async function createAuthorizeUrl(
  authorizeUrl: string,
  options: GetAuthorizationUrlOptions,
): Promise<AuthorizeUrlResult> {
  const baseUrl = new URL(authorizeUrl).origin;

  const authorizeUrlOptions = generateAuthUrlValues({
    clientId: options.clientId,
    serverConfig: { baseUrl },
    responseType: options.responseType,
    redirectUri: options.redirectUri,
    scope: options.scope,
  });

  const challenge = await createChallenge(authorizeUrlOptions.verifier);

  const requestParams = new URLSearchParams({
    ...options.query,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    client_id: options.clientId,
    prompt: options.prompt || '',
    redirect_uri: options.redirectUri,
    response_mode: options.responseMode || '',
    response_type: options.responseType,
    scope: options.scope,
    state: authorizeUrlOptions.state,
  });

  const url = new URL(`${authorizeUrl}?${requestParams.toString()}`);

  return {
    url: url.toString(),
    verifier: authorizeUrlOptions.verifier,
    state: authorizeUrlOptions.state,
  };
}
