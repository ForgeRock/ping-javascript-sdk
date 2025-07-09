import { oidc } from '@forgerock/oidc-client';

async function app() {
  const oidcClient = await oidc({
    config: {
      clientId: 'client_id',
      redirectUri: 'https://example.com/redirect',
      scope: 'openid',
      serverConfig: {
        wellknown:
          'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
      },
    },
  });

  const result = await oidcClient.authorize.url();

  console.log('Authorize URL:', result);
}

app();
