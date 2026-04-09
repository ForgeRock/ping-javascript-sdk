import { oidc } from '@forgerock/oidc-client';
import { WELLKNOWN_URL, CLIENT_ID, REDIRECT_URI, SCOPE, noopStorage } from '$lib/config.js';
import type { PageServerLoad } from './$types';

/**
 * Callback route — handles the redirect from the authorization server.
 *
 * Reads the authorization code and state from the URL, retrieves the PKCE
 * verifier from the cookie (set during authorize), and exchanges for tokens
 * entirely on the server. The browser never sees the verifier or tokens directly.
 */
export const load: PageServerLoad = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    return {
      tokens: null,
      error: { error, message: errorDescription ?? 'Authorization failed' },
    };
  }

  if (!code || !state) {
    return {
      tokens: null,
      error: { error: 'missing_params', message: 'Missing code or state in callback URL' },
    };
  }

  // Retrieve PKCE values from httpOnly cookies
  const verifier = cookies.get('pkce_verifier');
  const pkceState = cookies.get('pkce_state');

  // Clean up cookies
  cookies.delete('pkce_verifier', { path: '/' });
  cookies.delete('pkce_state', { path: '/' });

  if (!verifier || !pkceState) {
    return {
      tokens: null,
      error: { error: 'missing_pkce', message: 'PKCE verifier or state not found in cookies' },
    };
  }

  if (pkceState !== state) {
    return {
      tokens: null,
      error: { error: 'state_mismatch', message: 'State parameter does not match' },
    };
  }

  try {
    const client = await oidc({
      config: {
        serverConfig: { wellknown: WELLKNOWN_URL },
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scope: SCOPE,
        responseType: 'code',
      },
      storage: { type: 'custom', name: CLIENT_ID, custom: noopStorage },
    });

    if (!client || 'error' in client) {
      return {
        tokens: null,
        error: { error: 'oidc_init_failed', message: 'Failed to initialize OIDC client' },
      };
    }

    // Exchange code for tokens, providing PKCE values directly (no sessionStorage)
    const tokens = await client.token.exchange(code, state, {
      pkceValues: { verifier, state: pkceState },
    });

    if ('error' in tokens) {
      return {
        tokens: null,
        error: {
          error: tokens.error,
          message: 'message' in tokens ? tokens.message : 'Token exchange failed',
        },
      };
    }

    return {
      tokens: {
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
        ...(tokens.refreshToken && { refreshToken: tokens.refreshToken }),
      },
      error: null,
    };
  } catch (e) {
    return {
      tokens: null,
      error: {
        error: 'exchange_failed',
        message: e instanceof Error ? e.message : 'Token exchange failed',
      },
    };
  }
};
