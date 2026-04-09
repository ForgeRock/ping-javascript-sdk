/**
 * Server configuration for the SSR proof of concept.
 * Points at the AM mock API running on localhost:9443.
 */
export const WELLKNOWN_URL =
  'http://localhost:9443/am/oauth2/realms/root/.well-known/openid-configuration';

export const CLIENT_ID = 'SvelteSSRClient';
export const REDIRECT_URI = 'http://localhost:5174/callback';
export const SCOPE = 'openid profile';

/** No-op storage adapter for server-side usage where browser storage is unavailable. */
export const noopStorage = {
  get: async () => null,
  set: async () => {},
  remove: async () => {},
};
