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

import { generateAndStoreAuthUrlValues } from './state-pkce.effects.js';

import type { GetAuthorizationUrlOptions } from './authorize.types.js';

/**
 * @function createAuthorizeUrl - Create authorization URL for initial call to DaVinci
 * @param baseUrl {string}
 * @param options {GetAuthorizationUrlOptions}
 * @returns {Promise<string>} - the authorization URL
 */
export async function createAuthorizeUrl(
  authorizeUrl: string,
  options: GetAuthorizationUrlOptions,
): Promise<string> {
  /**
   * Generate state and verifier for PKCE
   */
  const baseUrl = new URL(authorizeUrl).origin;

  const [authorizeUrlOptions, storeOptions] = generateAndStoreAuthUrlValues({
    clientId: options.clientId,
    serverConfig: { baseUrl },
    responseType: options.responseType,
    redirectUri: options.redirectUri,
    scope: options.scope,
  });

  const challenge = await createChallenge(authorizeUrlOptions.verifier);

  const requestParams = new URLSearchParams({
    code_challenge: challenge,
    code_challenge_method: 'S256',
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_mode: 'pi.flow',
    response_type: options.responseType,
    scope: options.scope,
    state: authorizeUrlOptions.state,
  });

  const url = new URL(`${authorizeUrl}?${requestParams.toString()}`);

  storeOptions();

  return url.toString();
}
