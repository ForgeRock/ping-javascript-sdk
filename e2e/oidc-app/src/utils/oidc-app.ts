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
  OauthTokens,
  OidcClient,
  OidcConfig,
  SessionCheckOptions,
  TokenExchangeErrorResponse,
} from '@forgerock/oidc-client/types';

let tokenIndex = 0;

function displayError(error: unknown) {
  const errorEl = document.createElement('div');
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = 'Error:';
  const span = document.createElement('span');
  span.className = 'error';
  span.textContent = JSON.stringify(error, null, 2);
  p.append(strong, document.createTextNode(' '), span);
  errorEl.appendChild(p);
  document.body.appendChild(errorEl);
}

function displayTokenResponse(
  response: OauthTokens | TokenExchangeErrorResponse | GenericError | AuthorizationError,
) {
  if ('error' in response || !('accessToken' in response)) {
    console.error('Token Error:', response);
    displayError(response);
  } else {
    console.log('Token Response:', response);
    const appEl = document.getElementById('app');
    const logoutEl = document.getElementById('logout');
    const userInfoBtnEl = document.getElementById('user-info-btn');
    const loginBackgroundEl = document.getElementById('login-background');
    const loginRedirectEl = document.getElementById('login-redirect');

    if (logoutEl) {
      logoutEl.style.display = 'block';
    }
    if (userInfoBtnEl) {
      userInfoBtnEl.style.display = 'block';
    }
    if (loginBackgroundEl) {
      loginBackgroundEl.style.display = 'none';
    }
    if (loginRedirectEl) {
      loginRedirectEl.style.display = 'none';
    }

    const tokenInfoEl = document.createElement('div');
    const tokenP = document.createElement('p');
    const tokenStrong = document.createElement('strong');
    tokenStrong.textContent = 'Access Token:';
    const tokenSpan = document.createElement('span');
    tokenSpan.id = `accessToken-${tokenIndex}`;
    tokenSpan.textContent = response.accessToken;
    tokenP.append(tokenStrong, document.createTextNode(' '), tokenSpan);
    tokenInfoEl.appendChild(tokenP);
    appEl?.appendChild(tokenInfoEl);
    tokenIndex++;
  }
}

export async function oidcApp({
  config,
  urlParams,
}: {
  config: OidcConfig;
  urlParams: URLSearchParams;
}) {
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const piflow = urlParams.get('piflow');
  const par = urlParams.get('par') === 'true';

  const oidcClient: OidcClient = await oidc({
    config: { ...config, ...(par && { par: true }) },
  });
  if ('error' in oidcClient) {
    displayError(oidcClient);
    return;
  }

  document.getElementById('login-background')?.addEventListener('click', async () => {
    const authorizeOptions =
      piflow === 'true'
        ? {
            clientId: config.clientId,
            redirectUri: config.redirectUri,
            scope: config.scope,
            responseType: config.responseType ?? 'code',
            responseMode: 'pi.flow' as const,
          }
        : undefined;
    const response = await oidcClient.authorize?.background(authorizeOptions);

    if (!response) return;

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
      const tokenResponse = await oidcClient.token?.exchange(response.code, response.state);
      if (tokenResponse) {
        displayTokenResponse(tokenResponse);
      }
    }
  });

  document.getElementById('login-redirect')?.addEventListener('click', async () => {
    const authorizeUrl = await oidcClient.authorize?.url();
    if (!authorizeUrl) return;
    if (typeof authorizeUrl !== 'string' && 'error' in authorizeUrl) {
      console.error('Authorization URL Error:', authorizeUrl);
      displayError(authorizeUrl);
      return;
    } else {
      console.log('Authorization URL:', authorizeUrl);
      window.location.assign(authorizeUrl);
    }
  });

  document.getElementById('get-tokens')?.addEventListener('click', async () => {
    const response = await oidcClient.token?.get();
    if (response) {
      displayTokenResponse(response);
    }
  });

  document.getElementById('get-tokens-background')?.addEventListener('click', async () => {
    const response = await oidcClient.token?.get({ backgroundRenew: true });
    if (response) {
      displayTokenResponse(response);
    }
  });

  document.getElementById('renew-tokens')?.addEventListener('click', async () => {
    const response = await oidcClient.token?.get({ backgroundRenew: true, forceRenew: true });
    if (response) {
      displayTokenResponse(response);
    }
  });

  document.getElementById('user-info-btn')?.addEventListener('click', async () => {
    const userInfo = await oidcClient.user?.info();

    if (!userInfo) return;

    if ('error' in userInfo) {
      console.error('User Info Error:', userInfo);
      displayError(userInfo);
    } else {
      console.log('User Info:', userInfo);

      const appEl = document.getElementById('app');
      const userInfoEl = document.createElement('div');
      const userInfoP = document.createElement('p');
      const userInfoStrong = document.createElement('strong');
      userInfoStrong.textContent = 'User Info:';
      const userInfoSpan = document.createElement('span');
      userInfoSpan.id = 'userInfo';
      userInfoSpan.textContent = JSON.stringify(userInfo, null, 2);
      userInfoP.append(userInfoStrong, document.createTextNode(' '), userInfoSpan);
      userInfoEl.appendChild(userInfoP);
      appEl?.appendChild(userInfoEl);
    }
  });

  document.getElementById('revoke')?.addEventListener('click', async () => {
    const response = await oidcClient.token?.revoke();

    if (!response) return;

    if ('error' in response) {
      console.error('Token Revocation Error:', response);
      displayError(response);
    } else {
      const appEl = document.getElementById('app');
      const revokeEl = document.createElement('div');
      const revokeP = document.createElement('p');
      revokeP.textContent = 'Token successfully revoked';
      revokeEl.appendChild(revokeP);
      appEl?.appendChild(revokeEl);
    }
  });

  document.getElementById('logout')?.addEventListener('click', async () => {
    const response = await oidcClient.user?.logout();

    if (!response) return;

    if ('error' in response) {
      console.error('Logout Error:', response);
      displayError(response);
    } else {
      console.log('Logout successful');
      const logoutEl = document.getElementById('logout');
      const userInfoBtnEl = document.getElementById('user-info-btn');
      const loginBackgroundEl = document.getElementById('login-background');
      const loginRedirectEl = document.getElementById('login-redirect');

      if (logoutEl) {
        logoutEl.style.display = 'none';
      }
      if (userInfoBtnEl) {
        userInfoBtnEl.style.display = 'none';
      }
      if (loginBackgroundEl) {
        loginBackgroundEl.style.display = 'block';
      }
      if (loginRedirectEl) {
        loginRedirectEl.style.display = 'block';
      }
      window.location.assign(window.location.origin + window.location.pathname);
    }
  });

  document.getElementById('session-check-btn')?.addEventListener('click', async () => {
    const result = await oidcClient.user?.session();
    const appEl = document.getElementById('app');
    const el = document.createElement('div');
    const title = document.createElement('p');
    const titleStrong = document.createElement('strong');
    titleStrong.textContent = 'Session Check (none, iframe):';
    title.appendChild(titleStrong);
    const pre = document.createElement('pre');
    pre.id = 'session-check-result';
    pre.textContent = JSON.stringify(result, null, 2);
    el.append(title, pre);
    appEl?.appendChild(el);
  });

  document.getElementById('session-check-no-redirect-btn')?.addEventListener('click', async () => {
    const options: SessionCheckOptions = { redirectUri: '' };
    const result = await oidcClient.user?.session(options);
    const appEl = document.getElementById('app');
    const el = document.createElement('div');
    const title = document.createElement('p');
    const titleStrong = document.createElement('strong');
    titleStrong.textContent = 'Session Check (none, no redirect):';
    title.appendChild(titleStrong);
    const pre = document.createElement('pre');
    pre.id = 'session-check-no-redirect-result';
    pre.textContent = JSON.stringify(result, null, 2);
    el.append(title, pre);
    appEl?.appendChild(el);
  });

  document.getElementById('session-check-id-token-btn')?.addEventListener('click', async () => {
    const options: SessionCheckOptions = { responseType: 'id_token' };
    const result = await oidcClient.user?.session(options);
    const appEl = document.getElementById('app');
    const el = document.createElement('div');
    const title = document.createElement('p');
    const titleStrong = document.createElement('strong');
    titleStrong.textContent = 'Session Check (id_token):';
    title.appendChild(titleStrong);
    const pre = document.createElement('pre');
    pre.id = 'session-check-id-token-result';
    pre.textContent = JSON.stringify(result, null, 2);
    el.append(title, pre);
    appEl?.appendChild(el);
  });

  if (code && state) {
    const response = await oidcClient.token?.exchange(code, state);
    if (response) {
      displayTokenResponse(response);
    }
  }
}
