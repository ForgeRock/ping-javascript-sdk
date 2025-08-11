/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
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
  clientId: clientId || '654b14e2-7cc5-4977-8104-c4113e43c537',
  redirectUri: 'http://localhost:8443/ping-one/',
  scope: 'openid revoke profile email',
  serverConfig: {
    wellknown:
      wellknown ||
      'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/.well-known/openid-configuration',
  },
};

oidcApp({ config, urlParams });
