import { oidc } from '@forgerock/oidc-client';

async function app() {
  const oidcClient = await oidc({
    config: {
      clientId: 'WebOAuthClient',
      redirectUri: 'http://localhost:8443/',
      scope: 'openid',
      serverConfig: {
        wellknown:
          'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
      },
    },
  });

  // create object from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  // const state = urlParams.get('state');
  // get error and error_description if they exist
  const error = urlParams.get('error');
  // const errorDescription = urlParams.get('error_description');

  if (!code && !error) {
    const response = await oidcClient.authorize.background();

    if ('error' in response) {
      console.error('Authorization Error:', response);
      window.location.assign(response.redirectUrl);
      return;
    } else if ('code' in response) {
      console.log('Authorization Code:', response.code);
    }
  }
}

app();
