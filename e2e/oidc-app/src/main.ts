import { oidc } from '@forgerock/oidc-client';

// const pingAmConfig = {
//   config: {
//     clientId: 'WebOAuthClient',
//     redirectUri: 'http://localhost:8443/',
//     scope: 'openid',
//     serverConfig: {
//       wellknown:
//         'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
//     },
//   },
// };
const pingOneConfig = {
  config: {
    clientId: '654b14e2-7cc5-4977-8104-c4113e43c537',
    redirectUri: 'http://localhost:8443/',
    scope: 'openid',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/.well-known/openid-configuration',
    },
  },
};

async function app() {
  const oidcClient = await oidc(pingOneConfig);

  // create object from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  // get error and error_description if they exist
  const error = urlParams.get('error');
  // const errorDescription = urlParams.get('error_description');

  // Handle background authorization flow
  if (!code && !error) {
    const response = await oidcClient.authorize.background();

    if ('error' in response) {
      console.error('Authorization Error:', response);

      if (response.redirectUrl) {
        window.location.assign(response.redirectUrl);
      } else {
        console.log('Authorization failed with no ability to redirect:', response);
      }
      return;

      // Handle success response from background authorization
    } else if ('code' in response) {
      console.log('Authorization Code:', response.code);
      const tokenResponse = await oidcClient.token.exchange(response.code, response.state);
      if ('error' in response) {
        console.error('Token Exchange Error:', tokenResponse);
      } else {
        console.log('Token Exchange Response:', tokenResponse);
      }
    }

    // Handle the user redirecting after authentication
  } else if (code && state) {
    const response = await oidcClient.token.exchange(code, state);

    if ('error' in response) {
      console.error('Token Exchange Error:', response);
    } else {
      console.log('Token Exchange Response:', response);
    }
  }
}

app();
