import { oidc } from '@forgerock/oidc-client';

function displayTokenExhangeResponse(response) {
  if ('error' in response) {
    console.error('Token Exchange Error:', response);
  } else {
    console.log('Token Exchange Response:', response);
    document.getElementById('logout').style.display = 'block';
    document.getElementById('userinfo').style.display = 'block';
    document.getElementById('login-background').style.display = 'none';
    document.getElementById('login-redirect').style.display = 'none';

    const tokenInfo = document.createElement('div');
    tokenInfo.innerHTML = `<p><strong>Access Token:</strong> <span id="accessToken">${response.access_token}</span></p>`;
    document.body.appendChild(tokenInfo);
  }
}

export async function oidcApp({ config }) {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  const oidcClient = await oidc({ config });

  document.getElementById('login-background').addEventListener('click', async () => {
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
      displayTokenExhangeResponse(tokenResponse);
    }
  });

  document.getElementById('login-redirect').addEventListener('click', async () => {
    const authorizeUrl = await oidcClient.authorize.url();
    if (typeof authorizeUrl !== 'string' && 'error' in authorizeUrl) {
      console.error('Authorization URL Error:', authorizeUrl);
      return;
    } else {
      console.log('Authorization URL:', authorizeUrl);
      window.location.assign(authorizeUrl);
    }
  });

  document.getElementById('userinfo').addEventListener('click', async () => {
    const userInfo = await oidcClient.user.info();

    if ('error' in userInfo) {
      console.error('User Info Error:', userInfo);
    } else {
      console.log('User Info:', userInfo);
      const userInfoEl = document.createElement('div');
      userInfoEl.innerHTML = `<p><strong>User Info:</strong> <span id="userInfo">${JSON.stringify(userInfo, null, 2)}</span></p>`;
      document.body.appendChild(userInfoEl);
    }
  });

  document.getElementById('logout').addEventListener('click', async () => {
    const response = await oidcClient.user.logout();

    if (response && 'error' in response) {
      console.error('Logout Error:', response);
    } else {
      console.log('Logout successful');
      document.getElementById('logout').style.display = 'none';
      document.getElementById('userinfo').style.display = 'none';
      document.getElementById('login-background').style.display = 'block';
      document.getElementById('login-redirect').style.display = 'block';
      window.location.assign(window.location.origin + window.location.pathname);
    }
  });

  if (code && state) {
    const response = await oidcClient.token.exchange(code, state);
    displayTokenExhangeResponse(response);
  }
}
