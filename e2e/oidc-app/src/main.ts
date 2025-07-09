import { oidc } from '@forgerock/oidc-client';
import {
  CallbackType,
  Config,
  FRAuth,
  FRStep,
  NameCallback,
  PasswordCallback,
} from '@forgerock/javascript-sdk';

async function app() {
  await Config.setAsync({
    clientId: 'WebOAuthClient',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email me.read',
    serverConfig: {
      wellknown:
        'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
    },
  });

  const step = await FRAuth.start();
  console.log('Step:', step);

  if ('callbacks' in step) {
    const name = step.getCallbackOfType<NameCallback>(CallbackType.NameCallback);

    const password = step.getCallbackOfType<PasswordCallback>(CallbackType.PasswordCallback);

    name.setName('devicetestuser');
    password.setPassword('password');
  }

  const success = await FRAuth.next(step as FRStep);
  console.log('success:', success);

  const oidcClient = await oidc({
    serverConfig: {
      wellknown:
        'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
    },
  });

  if (oidcClient.error || !oidcClient.authorizeSilently || !oidcClient.createAuthorizeUrl) {
    console.error('Error initializing oidc client:', oidcClient.error);
    return;
  }

  const result = await oidcClient.authorizeSilently({
    clientId: 'WebOAuthClient',
    redirectUri: window.location.origin + '/',
    responseType: 'code',
    scope: 'openid',
  });

  if ('error' in result) {
    console.error('Error during authorization:', result.error);
    return;
  } else {
    console.log('returning resolved params,', result);
  }
}

app();
