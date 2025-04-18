/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the PKCE and ResponseType utilities from the JavaScript SDK
 */
import { PKCE, ResponseType } from '@forgerock/javascript-sdk';
import { generateAndStoreAuthUrlValues } from '@forgerock/javascript-sdk/src/oauth2-client/state-pkce';

/**
 * Define the options for the authorization URL
 * @param clientId The client ID of the application
 * @param redirectUri The redirect URI of the application
 * @param responseType The response type of the authorization request
 * @param scope The scope of the authorization request
 */
export interface GetAuthorizationUrlOptions {
  clientId: string;
  login: 'redirect';
  redirectUri: string;
  responseType: string;
  scope: string;
}

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
    login: options.login,
    // this type fails when module resolution is Node16
    // Probably because the javascript-sdk is set to bundler
    // so we need to make this correct with .js extensions if possible
    serverConfig: { baseUrl },
    responseType: ResponseType.Code,
  });

  const challenge = await PKCE.createChallenge(authorizeUrlOptions.verifier);

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
