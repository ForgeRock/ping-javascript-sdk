import type { NetworkData, OidcSemantics } from '@forgerock/devtools-types';
import type { OidcConfig } from './oidc-discovery.js';
import { matchesDiscoveredEndpoint, isWellKnownUrl } from './oidc-discovery.js';

type OidcPhase = OidcSemantics['oidcPhase'];

// Mutable builder type since Effect Schema makes OidcSemantics readonly
type MutableOidcSemantics = {
  -readonly [K in keyof OidcSemantics]: OidcSemantics[K] extends infer V
    ? V extends object
      ? { -readonly [P in keyof V]: V[P] }
      : V
    : never;
};

// Patterns match against the URL path (query string already stripped in detectPhase).
// Anchored with $ to avoid false positives on filenames like "authorize.request.js".
const PHASE_PATTERNS: Array<{ pattern: RegExp; phase: OidcPhase }> = [
  { pattern: /\.well-known\/openid-configuration$/, phase: 'discovery' },
  { pattern: /\.well-known\/oauth-authorization-server$/, phase: 'discovery' },
  { pattern: /\/authorize$/, phase: 'authorize' },
  { pattern: /\/par$/, phase: 'par' },
  { pattern: /\/oauth2\/token$|\/as\/token$|\/token$|\/access_token$/, phase: 'token' },
  { pattern: /\/userinfo$/, phase: 'userinfo' },
  { pattern: /\/revoke$/, phase: 'revocation' },
  { pattern: /\/introspect$/, phase: 'introspection' },
  { pattern: /\/end_session$|\/logout$/, phase: 'end-session' },
  { pattern: /\/jwks$/, phase: 'jwks' },
];

const STATIC_ASSET_PATTERN =
  /\.(js|mjs|cjs|ts|tsx|jsx|css|map|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)(\?|$)/;

export function annotateOidc(
  data: NetworkData,
  discoveredConfig: OidcConfig | null,
): OidcSemantics | null {
  // Static assets are never OIDC endpoints
  if (STATIC_ASSET_PATTERN.test(data.url)) return null;

  const phase = detectPhase(data.url, discoveredConfig);
  if (!phase) return null;

  const base: MutableOidcSemantics = {
    _tag: 'oidc-semantics',
    oidcPhase: phase,
  };

  switch (phase) {
    case 'discovery':
      break;

    case 'authorize':
      annotateAuthorize(data, base);
      break;

    case 'par':
      annotatePar(data, base);
      break;

    case 'token':
      annotateToken(data, base);
      break;

    case 'userinfo':
    case 'revocation':
    case 'introspection':
    case 'end-session':
    case 'jwks':
      break;
  }

  annotateErrorResponse(data, base);

  return base as OidcSemantics;
}

function detectPhase(url: string, config: OidcConfig | null): OidcPhase | null {
  if (isWellKnownUrl(url)) return 'discovery';

  const discoveredPhase = matchesDiscoveredEndpoint(url, config);
  if (discoveredPhase) return discoveredPhase as OidcPhase;

  const urlNoQuery = url.split('?')[0];
  for (const { pattern, phase } of PHASE_PATTERNS) {
    if (pattern.test(urlNoQuery)) return phase;
  }

  return null;
}

function annotateAuthorize(data: NetworkData, result: MutableOidcSemantics): void {
  const params = parseUrlParams(data.url);

  result.clientId = params['client_id'];
  result.state = params['state'];
  result.nonce = params['nonce'];

  if (params['request_uri']) {
    result.par = { requestUri: params['request_uri'] };
  }

  const challengeMethod = params['code_challenge_method'];
  const hasChallenge = !!params['code_challenge'];
  if (hasChallenge || challengeMethod) {
    result.pkce = {
      challengeMethod: challengeMethod ?? 'plain',
      hasVerifier: false,
    };
  }
}

function annotatePar(data: NetworkData, result: MutableOidcSemantics): void {
  const formBody = parseFormBody(data);
  result.clientId = formBody['client_id'];
  result.state = formBody['state'];

  const challengeMethod = formBody['code_challenge_method'];
  const hasChallenge = !!formBody['code_challenge'];
  if (hasChallenge || challengeMethod) {
    result.pkce = {
      challengeMethod: challengeMethod ?? 'plain',
      hasVerifier: false,
    };
  }

  if (typeof data.responseBody === 'object' && data.responseBody !== null) {
    const respBody = data.responseBody as Record<string, unknown>;
    if (typeof respBody['request_uri'] === 'string') {
      result.par = {
        requestUri: respBody['request_uri'],
        expiresIn: typeof respBody['expires_in'] === 'number' ? respBody['expires_in'] : undefined,
      };
    }
  }
}

function annotateToken(data: NetworkData, result: MutableOidcSemantics): void {
  const formBody = parseFormBody(data);
  result.grantType = formBody['grant_type'];
  result.clientId = formBody['client_id'];

  const hasVerifier = !!formBody['code_verifier'];
  if (hasVerifier) {
    result.pkce = {
      challengeMethod: 'S256',
      hasVerifier: true,
    };
  }

  if (typeof data.responseBody === 'object' && data.responseBody !== null) {
    const respBody = data.responseBody as Record<string, unknown>;
    result.tokens = {
      accessToken: typeof respBody['access_token'] === 'string' ? true : undefined,
      refreshToken: typeof respBody['refresh_token'] === 'string' ? true : undefined,
      idToken: typeof respBody['id_token'] === 'string' ? true : undefined,
      tokenType: typeof respBody['token_type'] === 'string' ? respBody['token_type'] : undefined,
      expiresIn: typeof respBody['expires_in'] === 'number' ? respBody['expires_in'] : undefined,
    };
  }
}

function annotateErrorResponse(data: NetworkData, result: MutableOidcSemantics): void {
  if (typeof data.responseBody !== 'object' || data.responseBody === null) return;
  const body = data.responseBody as Record<string, unknown>;
  if (typeof body['error'] === 'string') {
    result.error = {
      error: body['error'],
      errorDescription:
        typeof body['error_description'] === 'string' ? body['error_description'] : undefined,
    };
  }
}

function parseUrlParams(url: string): Record<string, string> {
  const questionMark = url.indexOf('?');
  if (questionMark === -1) return {};
  try {
    const params = new URLSearchParams(url.slice(questionMark + 1));
    const result: Record<string, string> = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

function parseFormBody(data: NetworkData): Record<string, string> {
  const contentType = data.requestHeaders['content-type'] ?? '';

  if (
    contentType.includes('application/x-www-form-urlencoded') &&
    typeof data.requestBody === 'string'
  ) {
    try {
      const params = new URLSearchParams(data.requestBody);
      const result: Record<string, string> = {};
      for (const [key, value] of params) {
        result[key] = value;
      }
      return result;
    } catch {
      return {};
    }
  }

  if (typeof data.requestBody === 'object' && data.requestBody !== null) {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data.requestBody as Record<string, unknown>)) {
      if (typeof value === 'string') result[key] = value;
    }
    return result;
  }

  return {};
}
