import { davinci } from '@forgerock/davinci-client';

const client = await davinci({
  config: {
    serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
    clientId: 'test-client',
    redirectUri: 'https://example.com/callback',
    scope: 'openid profile',
  },
});

const node = await client.start();
console.log(node);
