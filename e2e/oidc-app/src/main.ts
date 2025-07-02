import { initialize } from '@forgerock/oidc-client';
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

  const oidcClient = initialize({
    serverConfig: {
      wellknown:
        'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
    },
    responseType: 'code',
    skipBackgroundRequest: true,
  });

  // const params = {
  //   successParams: ['state', 'code', 'authCode'],
  //   errorParams: ['error', 'error_description'],
  // };

  const result = await oidcClient.authorize({
    clientId: 'WebOAuthClient',
    redirectUri: window.location.origin + '/',
    responseType: 'code',
    scope: 'openid',
  });

  if (typeof result === 'string') {
    console.log('Authorization URL:', result);
    window.location.assign(result);
    return;
  } else if ('err' in result) {
    console.error('Error during authorization:', result.err);
    return;
  } else {
    console.log('returning resolved params,', result);
  }
}

app();
