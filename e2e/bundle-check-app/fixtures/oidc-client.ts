import { oidc } from '@forgerock/oidc-client';

const client = await oidc({
  config: {
    serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
    clientId: 'test-client',
    redirectUri: 'https://example.com/callback',
    scope: 'openid profile',
  },
});

const url = await client.getAuthorizationUrl();
console.log(url);
