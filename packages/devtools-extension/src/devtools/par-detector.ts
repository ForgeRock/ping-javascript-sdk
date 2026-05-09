import type { NetworkData, OidcSemantics } from '@forgerock/devtools-types';
import type { OidcConfig } from './oidc-discovery.js';

type ParInfo = NonNullable<OidcSemantics['par']>;

export function detectPar(data: NetworkData, discoveredConfig: OidcConfig | null): ParInfo | null {
  if (!isParEndpoint(data.url, data.method, discoveredConfig)) return null;

  if (typeof data.responseBody !== 'object' || data.responseBody === null) return null;

  const body = data.responseBody as Record<string, unknown>;
  const requestUri = typeof body['request_uri'] === 'string' ? body['request_uri'] : undefined;
  const expiresIn = typeof body['expires_in'] === 'number' ? body['expires_in'] : undefined;

  if (!requestUri) return null;

  return { requestUri, expiresIn };
}

function isParEndpoint(url: string, method: string, config: OidcConfig | null): boolean {
  if (method.toUpperCase() !== 'POST') return false;

  if (config?.pushedAuthorizationRequestEndpoint) {
    const urlNoQuery = url.split('?')[0];
    if (urlNoQuery === config.pushedAuthorizationRequestEndpoint) return true;
  }

  return /\/par$/.test(url.split('?')[0]);
}
