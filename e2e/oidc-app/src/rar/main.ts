/*
 *
 * Copyright (c) 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { oidcApp } from '../utils/oidc-app.js';

const urlParams = new URLSearchParams(window.location.search);

const config = {
  clientId: 'rar',
  redirectUri: 'http://localhost:8443/rar/',
  scope: 'openid profile email',
  serverConfig: {
    wellknown:
      'https://openam-stoyan.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
  },
  authorizationDetails: [
    {
      type: 'account_information',
      actions: ['list_accounts', 'read_balances'],
      locations: ['https://example.com/accounts'],
      datatypes: ['balances'],
    },
  ],
};

oidcApp({ config, urlParams });
