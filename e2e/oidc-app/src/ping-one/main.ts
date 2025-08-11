import { oidcApp } from '../utils/oidc-app.js';

const config = {
  clientId: '654b14e2-7cc5-4977-8104-c4113e43c537',
  redirectUri: 'http://localhost:8443/ping-one/',
  scope: 'openid revoke profile email',
  serverConfig: {
    wellknown:
      'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/.well-known/openid-configuration',
  },
};

oidcApp({ config });
