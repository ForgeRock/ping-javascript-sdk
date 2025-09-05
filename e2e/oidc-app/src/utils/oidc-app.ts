/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */
import { oidc } from '@forgerock/oidc-client';
import type {
  AuthorizationError,
  GenericError,
  GetAuthorizationUrlOptions,
  OauthTokens,
  TokenExchangeErrorResponse,
} from '@forgerock/oidc-client/types';

let tokenIndex = 0;

function displayError(error) {
  const errorEl = document.createElement('div');
  errorEl.innerHTML = `<p><strong>Error:</strong> <span class="error">${JSON.stringify(error, null, 2)}</span></p>`;
  document.body.appendChild(errorEl);
}

function displayTokenResponse(
  response: OauthTokens | TokenExchangeErrorResponse | GenericError | AuthorizationError,
) {
  const appEl = document.getElementById('app');
  if ('error' in response || !('accessToken' in response)) {
    console.error('Token Error:', response);
    displayError(response);
  } else {
    console.log('Token Response:', response);
    document.getElementById('logout').style.display = 'block';
    document.getElementById('user-info-btn').style.display = 'block';
    document.getElementById('login-background').style.display = 'none';
    document.getElementById('login-redirect').style.display = 'none';

    const tokenInfoEl = document.createElement('div');
    tokenInfoEl.innerHTML = `<p><strong>Access Token:</strong> <span id="accessToken-${tokenIndex}">${response.accessToken}</span></p>`;
    appEl.appendChild(tokenInfoEl);
    tokenIndex++;
  }
}

export async function oidcApp({ config, urlParams }) {
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const piflow = urlParams.get('piflow');

  const oidcClient = await oidc({ config });
  if ('error' in oidcClient) {
    displayError(oidcClient);
  }

  document.getElementById('login-background').addEventListener('click', async () => {
    const authorizeOptions: GetAuthorizationUrlOptions =
      piflow === 'true'
        ? {
            clientId: config.clientId,
            redirectUri: config.redirectUri,
            scope: config.scope,
            responseType: config.responseType ?? 'code',
            responseMode: 'pi.flow',
          }
        : undefined;
    const response = await oidcClient.authorize.background(authorizeOptions);

    if ('error' in response) {
      console.error('Authorization Error:', response);
      displayError(response);

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
      displayTokenResponse(tokenResponse);
    }
  });

  document.getElementById('login-redirect').addEventListener('click', async () => {
    const authorizeUrl = await oidcClient.authorize.url();
    if (typeof authorizeUrl !== 'string' && 'error' in authorizeUrl) {
      console.error('Authorization URL Error:', authorizeUrl);
      displayError(authorizeUrl);
      return;
    } else {
      console.log('Authorization URL:', authorizeUrl);
      window.location.assign(authorizeUrl);
    }
  });

  document.getElementById('get-tokens').addEventListener('click', async () => {
    const response = await oidcClient.token.get();
    displayTokenResponse(response);
  });

  document.getElementById('renew-tokens').addEventListener('click', async () => {
    const response = await oidcClient.token.get({ backgroundRenew: true });
    displayTokenResponse(response);
  });

  document.getElementById('user-info-btn').addEventListener('click', async () => {
    const userInfo = await oidcClient.user.info();

    if ('error' in userInfo) {
      console.error('User Info Error:', userInfo);
      displayError(userInfo);
    } else {
      console.log('User Info:', userInfo);

      const appEl = document.getElementById('app');
      const userInfoEl = document.createElement('div');
      userInfoEl.innerHTML = `<p><strong>User Info:</strong> <span id="userInfo">${JSON.stringify(userInfo, null, 2)}</span></p>`;
      appEl.appendChild(userInfoEl);
    }
  });

  document.getElementById('revoke').addEventListener('click', async () => {
    const response = await oidcClient.token.revoke();

    if ('error' in response) {
      console.error('Token Revocation Error:', response);
      displayError(response);
    } else {
      const appEl = document.getElementById('app');
      const userInfoEl = document.createElement('div');
      userInfoEl.innerHTML = `<p>Token successfully revoked</p>`;
      appEl.appendChild(userInfoEl);
    }
  });

  document.getElementById('logout').addEventListener('click', async () => {
    const response = await oidcClient.user.logout();

    if ('error' in response) {
      console.error('Logout Error:', response);
      displayError(response);
    } else {
      console.log('Logout successful');
      document.getElementById('logout').style.display = 'none';
      document.getElementById('user-info-btn').style.display = 'none';
      document.getElementById('login-background').style.display = 'block';
      document.getElementById('login-redirect').style.display = 'block';
      window.location.assign(window.location.origin + window.location.pathname);
    }
  });

  if (code && state) {
    const response = await oidcClient.token.exchange(code, state);
    displayTokenResponse(response);
  }
}
