/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { ServerConfig, WellknownResponse } from '@forgerock/sdk-types';

/**
 * @function convertWellknown - Convert the response from wellknown into SDK config
 * @param {WellknownResponse} data - response from wellknown endpoint
 * @returns {ServerConfig}
 */
export function convertWellknown(data: WellknownResponse): ServerConfig {
  if (!data.authorization_endpoint) {
    throw new Error('Wellknown endpoint did not return `authorization_endpoint`');
  }

  const fullUrl = new URL(data.authorization_endpoint);
  const baseUrl = fullUrl.origin;
  const authenticateUrl = `${data.issuer.replace('oauth2', 'json')}/authenticate`;
  const sessionsUrl = `${data.issuer.replace('oauth2', 'json')}/sessions`;

  const paths = {
    authenticate: new URL(authenticateUrl).pathname,
    sessions: new URL(sessionsUrl).pathname,
  };

  return {
    baseUrl,
    paths,
  };
}
