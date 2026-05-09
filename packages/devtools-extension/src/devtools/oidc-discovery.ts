export interface OidcConfig {
  issuer: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userinfoEndpoint?: string;
  revocationEndpoint?: string;
  introspectionEndpoint?: string;
  pushedAuthorizationRequestEndpoint?: string;
  endSessionEndpoint?: string;
  jwksUri?: string;
}

export function parseWellKnownResponse(responseBody: unknown): OidcConfig | null {
  if (!responseBody || typeof responseBody !== 'object') return null;
  const body = responseBody as Record<string, unknown>;

  const issuer = body['issuer'];
  if (typeof issuer !== 'string') return null;

  return {
    issuer,
    authorizationEndpoint: asString(body['authorization_endpoint']),
    tokenEndpoint: asString(body['token_endpoint']),
    userinfoEndpoint: asString(body['userinfo_endpoint']),
    revocationEndpoint: asString(body['revocation_endpoint']),
    introspectionEndpoint: asString(body['introspection_endpoint']),
    pushedAuthorizationRequestEndpoint: asString(body['pushed_authorization_request_endpoint']),
    endSessionEndpoint: asString(body['end_session_endpoint']),
    jwksUri: asString(body['jwks_uri']),
  };
}

export function isWellKnownUrl(url: string): boolean {
  return (
    url.includes('/.well-known/openid-configuration') ||
    url.includes('/.well-known/oauth-authorization-server')
  );
}

export function matchesDiscoveredEndpoint(url: string, config: OidcConfig | null): string | null {
  if (!config) return null;

  const urlNoQuery = url.split('?')[0];

  if (config.authorizationEndpoint && urlNoQuery === config.authorizationEndpoint)
    return 'authorize';
  if (config.tokenEndpoint && urlNoQuery === config.tokenEndpoint) return 'token';
  if (config.userinfoEndpoint && urlNoQuery === config.userinfoEndpoint) return 'userinfo';
  if (config.revocationEndpoint && urlNoQuery === config.revocationEndpoint) return 'revocation';
  if (config.introspectionEndpoint && urlNoQuery === config.introspectionEndpoint)
    return 'introspection';
  if (
    config.pushedAuthorizationRequestEndpoint &&
    urlNoQuery === config.pushedAuthorizationRequestEndpoint
  )
    return 'par';
  if (config.endSessionEndpoint && urlNoQuery === config.endSessionEndpoint) return 'end-session';
  if (config.jwksUri && urlNoQuery === config.jwksUri) return 'jwks';

  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
