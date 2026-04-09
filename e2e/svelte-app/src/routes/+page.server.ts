import { redirect } from '@sveltejs/kit';
import { journey } from '@forgerock/journey-client';
import { oidc } from '@forgerock/oidc-client';
import { WELLKNOWN_URL, CLIENT_ID, REDIRECT_URI, SCOPE, noopStorage } from '$lib/config.js';
import type { PageServerLoad, Actions } from './$types';

/**
 * Server-side load function.
 *
 * Initializes the journey client with noop storage (no sessionStorage on server)
 * and calls start() to fetch the first authentication step. The raw step payload
 * is serialized and passed to the client for SSR rendering.
 */
export const load: PageServerLoad = async () => {
  try {
    const client = await journey({
      config: {
        serverConfig: { wellknown: WELLKNOWN_URL },
        storage: { type: 'custom', name: 'journey-step', custom: noopStorage },
      },
    });

    const result = await client.start();

    if ('payload' in result) {
      return {
        stepPayload: result.payload,
        error: null,
      };
    }

    return {
      stepPayload: null,
      error: 'error' in result ? result : { error: 'unexpected', message: 'Unexpected result' },
    };
  } catch (e) {
    return {
      stepPayload: null,
      error: {
        error: 'server_init_failed',
        message: e instanceof Error ? e.message : 'Failed to initialize journey client on server',
      },
    };
  }
};

/**
 * Form actions — the authorize action generates a PKCE authorize URL on the server,
 * stores the verifier in a cookie, and redirects the browser to the authorize endpoint.
 */
export const actions: Actions = {
  authorize: async ({ cookies }) => {
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
      return { error: 'Failed to initialize OIDC client' };
    }

    // Generate authorize URL with PKCE — returns { url, verifier, state }
    const result = await client.authorize.url();

    if ('error' in result) {
      return { error: result.error };
    }

    // Store PKCE verifier + state in an httpOnly cookie for the callback route
    cookies.set('pkce_verifier', result.verifier, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
    });
    cookies.set('pkce_state', result.state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 300,
    });

    // Redirect browser to authorization endpoint
    redirect(303, result.url);
  },
};
