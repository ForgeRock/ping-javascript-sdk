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
import { buildAuthorizeParams } from './authorize.utils.js';

import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

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

  const requestParams = buildAuthorizeParams({
    ...options,
    challenge,
    state: authorizeUrlOptions.state,
  });

  const url = new URL(`${authorizeUrl}?${requestParams.toString()}`);

  storeOptions();

  return url.toString();
}
