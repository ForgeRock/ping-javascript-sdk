/**
 *
 * Copyright © 2025 Ping Identity Corporation
 *
 **/

/**
 * Import the PKCE and ResponseType utilities from the JavaScript SDK
 */
import PKCE from './pkce.utils.js';
import {
  CreateAuthorizeUrlOptions,
  GenerateAndStoreAuthUrlValues,
  ResponseType,
} from './authorize.utils.types.js';

function getStorageKey(clientId: string, prefix?: string) {
  return `${prefix || 'FR-SDK'}-authflow-${clientId}`;
}

/**
 * Generate and store PKCE values for later use
 * @param { string } storageKey - Key to store authorization options in sessionStorage
 * @param {GenerateAndStoreAuthUrlValues} options - Options for generating PKCE values
 * @returns { state: string, verifier: string, GetAuthorizationUrlOptions }
 */
function generateAndStoreAuthUrlValues(options: GenerateAndStoreAuthUrlValues) {
  const verifier = PKCE.createVerifier();
  const state = PKCE.createState();
  const storageKey = getStorageKey(options.clientId, options.prefix);

  const authorizeUrlOptions = {
    ...options,
    state,
    verifier,
  };

  return [
    authorizeUrlOptions,
    () => sessionStorage.setItem(storageKey, JSON.stringify(authorizeUrlOptions)),
  ] as const;
}

/**
 * @function createAuthorizeUrl - Create authorization URL for initial call to DaVinci
 * @param baseUrl {string}
 * @param options {CreateAuthorizeUrlOptions}
 * @returns {Promise<string>} - the authorization URL
 */
export async function createAuthorizeUrl(
  authorizeUrl: string,
  options: CreateAuthorizeUrlOptions,
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
