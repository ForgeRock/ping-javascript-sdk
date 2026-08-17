/*
 *
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { oidcApp } from '../utils/oidc-app.js';

const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get('clientid');
const wellknown = urlParams.get('wellknown');

const config = {
  clientId: clientId || '00e62f85-3d49-4046-b860-15aefdebbb0d',
  redirectUri: 'http://localhost:8443/ping-one/',
  scope: 'openid revoke profile email',
  serverConfig: {
    wellknown:
      wellknown ||
      'https://auth.pingone.ca/356a254c-cba3-4ade-be1a-860136e8df01/as/.well-known/openid-configuration',
  },
};

oidcApp({ config, urlParams });
