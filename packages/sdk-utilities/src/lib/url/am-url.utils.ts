/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { GetEndpointPathParams } from './am-url.types.js';

/** ****************************************************************
 * @function getRealmUrlPath - Get the realm URL path
 * @param {string} realmPath - The realm path
 * @returns {string} - The realm URL path
 */
export function getRealmUrlPath(realmPath?: string): string {
  // Split the path and scrub segments
  const names = (realmPath || '')
    .split('/')
    .map((x) => x.trim())
    .filter((x) => x !== '');

  // Ensure 'root' is the first realm
  if (names[0] !== 'root') {
    names.unshift('root');
  }

  // Concatenate into a URL path
  const urlPath = names.map((x) => `realms/${x}`).join('/');
  return urlPath;
}

/** ****************************************************************
 * @function getEndpointPath - Get the endpoint path
 * @param {GetEndpointPathParams} - The endpoint, realm path, and custom paths params
 * @returns {string} - The endpoint path
 */
export function getEndpointPath({
  endpoint,
  realmPath,
  customPaths,
}: GetEndpointPathParams): string {
  const realmUrlPath = getRealmUrlPath(realmPath);
  const defaultPaths = {
    authenticate: `json/${realmUrlPath}/authenticate`,
    authorize: `oauth2/${realmUrlPath}/authorize`,
    accessToken: `oauth2/${realmUrlPath}/access_token`,
    endSession: `oauth2/${realmUrlPath}/connect/endSession`,
    userInfo: `oauth2/${realmUrlPath}/userinfo`,
    revoke: `oauth2/${realmUrlPath}/token/revoke`,
    sessions: `json/${realmUrlPath}/sessions/`,
  };
  if (customPaths && customPaths[endpoint]) {
    return customPaths[endpoint];
  } else {
    return defaultPaths[endpoint];
  }
}
