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
  clientId: clientId || 'WebOAuthClient',
  redirectUri: 'http://localhost:8443/ping-am/',
  scope: 'openid profile email',
  serverConfig: {
    wellknown:
      wellknown ||
      'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
  },
};

oidcApp({ config, urlParams });
