import { oidcApp } from '../utils/oidc-app.js';

const config = {
  clientId: 'WebOAuthClient',
  redirectUri: 'http://localhost:8443/ping-am/',
  scope: 'openid profile email',
  serverConfig: {
    wellknown:
      'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
  },
};

oidcApp({ config });
