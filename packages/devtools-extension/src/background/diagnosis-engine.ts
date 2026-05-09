import type { AuthEvent } from '@forgerock/devtools-types';
import { decodeJwtPayload, findExpiredJwtsInHeaders } from '../shared/jwt-utils.js';

export type Severity = 'error' | 'warning' | 'info';

export type DiagnosisCategory =
  | 'cors'
  | 'token'
  | 'flow-config'
  | 'oidc'
  | 'dpop'
  | 'par'
  | 'oidc-flow';

export interface FlowIssue {
  id: string;
  severity: Severity;
  category: DiagnosisCategory;
  title: string;
  description: string;
  steps: string[];
  relatedEventIds: string[];
  relevantData?: Record<string, string>;
}

export interface EventIssue {
  severity: Severity;
  title: string;
  description: string;
  steps: string[];
  relevantData?: Record<string, string>;
}

export interface DiagnosisResult {
  issues: FlowIssue[];
  annotatedEvents: Map<string, EventIssue[]>;
  flowHealth: 'healthy' | 'warning' | 'error';
}

// ─── Deduplication helper ─────────────────────────────────────────────────────

type IssueCandidate = {
  dedupKey: string;
  eventId: string;
  issue: Omit<FlowIssue, 'relatedEventIds'>;
};

function mergeByDedupKey(candidates: IssueCandidate[]): FlowIssue[] {
  const merged = new Map<string, FlowIssue>();
  for (const { dedupKey, eventId, issue } of candidates) {
    const existing = merged.get(dedupKey);
    if (existing) {
      merged.set(dedupKey, {
        ...existing,
        relatedEventIds: [...existing.relatedEventIds, eventId],
      });
    } else {
      merged.set(dedupKey, { ...issue, relatedEventIds: [eventId] });
    }
  }
  return [...merged.values()];
}

// ─── CORS rules ───────────────────────────────────────────────────────────────

function collectCorsIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];

  for (const event of events) {
    if (event.data._tag !== 'network') continue;
    const { data } = event;
    const origin = data.requestHeaders['origin'] ?? '';
    const allowOrigin = data.responseHeaders['access-control-allow-origin'] ?? '';
    const allowCredentials = data.responseHeaders['access-control-allow-credentials'] ?? '';
    const hasOriginHeader = 'origin' in data.requestHeaders;

    if (data.status === 0 && event.flags.isCors) {
      candidates.push({
        dedupKey: `cors:status-zero:${origin}`,
        eventId: event.id,
        issue: {
          id: 'cors:status-zero',
          severity: 'error',
          category: 'cors',
          title: 'Network failure (status 0)',
          description:
            'The request never reached the server. This is almost always a CORS preflight rejection.',
          steps: [
            `Your auth server must include this origin in allowed origins: ${origin || '(unknown)'}`,
            'Check the OPTIONS preflight request in the Network tab.',
            'If using credentials, wildcard (*) is not allowed as the allowed origin.',
          ],
          relevantData: origin ? { origin } : undefined,
        },
      });
    }

    if (hasOriginHeader && !allowOrigin && data.status !== 0 && event.flags.isCors) {
      candidates.push({
        dedupKey: `cors:missing-allow-origin:${origin}`,
        eventId: event.id,
        issue: {
          id: 'cors:missing-allow-origin',
          severity: 'error',
          category: 'cors',
          title: 'Missing CORS header',
          description: 'The server response is missing Access-Control-Allow-Origin.',
          steps: [
            `Add ${origin} to allowed origins on your auth server.`,
            'Verify the request origin matches what is configured in your AS CORS settings.',
          ],
          relevantData: { 'missing-header': 'access-control-allow-origin', origin },
        },
      });
    }

    if (allowOrigin === '*' && allowCredentials === 'true') {
      candidates.push({
        dedupKey: `cors:wildcard-with-credentials:${data.url}`,
        eventId: event.id,
        issue: {
          id: 'cors:wildcard-with-credentials',
          severity: 'error',
          category: 'cors',
          title: 'Wildcard CORS with credentials',
          description:
            'access-control-allow-origin: * cannot be used together with access-control-allow-credentials: true.',
          steps: [
            `Replace wildcard with an explicit origin: ${origin || '(your app origin)'}`,
            'Configure your auth server to reflect the specific requesting origin.',
          ],
          relevantData: {
            'access-control-allow-origin': '*',
            'access-control-allow-credentials': 'true',
          },
        },
      });
    }

    if (
      hasOriginHeader &&
      allowCredentials === 'false' &&
      data.requestHeaders['cookie'] !== undefined
    ) {
      candidates.push({
        dedupKey: `cors:credentials-not-allowed:${origin}`,
        eventId: event.id,
        issue: {
          id: 'cors:credentials-not-allowed',
          severity: 'warning',
          category: 'cors',
          title: 'Credentials not allowed by server',
          description:
            'The server set access-control-allow-credentials: false but cookies were sent.',
          steps: [
            'Enable credentials on the auth server CORS config.',
            'Or remove the cookie from the request.',
          ],
        },
      });
    }
  }

  return candidates;
}

// ─── Token / Session rules ────────────────────────────────────────────────────

function collectTokenIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];

  const sdkNodeEvents = events.filter((e) => e.type === 'sdk:node-change');

  // Missing interactionToken on non-first sdk:node-change
  if (sdkNodeEvents.length > 1) {
    for (const event of sdkNodeEvents.slice(1)) {
      if (event.data._tag !== 'sdk') continue;
      if (!event.data.interactionToken) {
        candidates.push({
          dedupKey: `token:missing-interaction-token:${event.id}`,
          eventId: event.id,
          issue: {
            id: 'token:missing-interaction-token',
            severity: 'warning',
            category: 'token',
            title: 'Missing interaction token',
            description: 'interactionToken was absent on a node transition that required it.',
            steps: [
              'Check SDK initialization — do not cache or reuse stale tokens across flows.',
              'Ensure each flow starts fresh rather than resuming an expired interaction.',
            ],
          },
        });
      }
    }
  }

  // Session error codes
  for (const event of events) {
    if (event.data._tag !== 'sdk') continue;
    const errorCode = event.data.error?.code ?? '';
    if (errorCode.includes('SESSION_NOT_FOUND') || errorCode.includes('INVALID_SESSION')) {
      candidates.push({
        dedupKey: `token:session-not-found`,
        eventId: event.id,
        issue: {
          id: 'token:session-not-found',
          severity: 'error',
          category: 'token',
          title: 'Session not found',
          description: 'The session referenced by this flow no longer exists on the server.',
          steps: [
            'Session may have expired — reinitialize the SDK.',
            'Avoid persisting flowId or interactionId across page reloads without validation.',
          ],
          relevantData: { 'error-code': errorCode },
        },
      });
    }
  }

  return candidates;
}

// ─── Flow Config rules ────────────────────────────────────────────────────────

function collectFlowConfigIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];

  for (const event of events) {
    if (event.data._tag !== 'sdk') continue;
    const { data } = event;
    const { nodeStatus } = data;
    const errorCode = data.error?.code ?? '';

    if (nodeStatus === 'error' || nodeStatus === 'failure') {
      const nodeName = data.nodeName ?? '';
      candidates.push({
        dedupKey: `flow:node-error:${event.id}`,
        eventId: event.id,
        issue: {
          id: 'flow:node-error',
          severity: 'error',
          category: 'flow-config',
          title: nodeName ? `Node error: ${nodeName}` : 'Node error',
          description: `A DaVinci node returned status "${nodeStatus}".`,
          steps: [
            'Check connector configuration in DaVinci admin.',
            'Review the error code in the SDK State tab.',
          ],
          relevantData: nodeName ? { node: nodeName, status: nodeStatus } : { status: nodeStatus },
        },
      });
    }

    if (errorCode === 'CONNECTOR_ERROR') {
      const httpStatus = data.error?.internalHttpStatus;
      candidates.push({
        dedupKey: `flow:connector-error:${event.id}`,
        eventId: event.id,
        issue: {
          id: 'flow:connector-error',
          severity: 'error',
          category: 'flow-config',
          title: httpStatus ? `Connector error (HTTP ${httpStatus})` : 'Connector error',
          description: 'A DaVinci connector returned an HTTP error from its upstream endpoint.',
          steps: [
            'Verify connector credentials and endpoint URL in DaVinci admin.',
            'Check the upstream service is reachable from your DaVinci environment.',
          ],
          relevantData: httpStatus ? { 'internal-http-status': String(httpStatus) } : undefined,
        },
      });
    }

    if (errorCode === 'NOT_FOUND') {
      candidates.push({
        dedupKey: `flow:policy-not-found`,
        eventId: event.id,
        issue: {
          id: 'flow:policy-not-found',
          severity: 'error',
          category: 'flow-config',
          title: 'Flow policy not found',
          description: 'The policy ID used to start this flow does not exist in the environment.',
          steps: [
            'Verify the policy ID (acr_values or flowId) matches your DaVinci environment.',
            'Check that the policy is published and assigned to the correct application.',
          ],
        },
      });
    }
  }

  return candidates;
}

// ─── OIDC rules ───────────────────────────────────────────────────────────────

function collectOidcIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];

  for (const event of events) {
    if (event.data._tag !== 'dom') continue;
    const url = event.data.url ?? '';

    if (url.includes('error=state_mismatch')) {
      candidates.push({
        dedupKey: `oidc:state-mismatch`,
        eventId: event.id,
        issue: {
          id: 'oidc:state-mismatch',
          severity: 'error',
          category: 'oidc',
          title: 'State mismatch',
          description:
            'The OAuth state parameter in the callback does not match the one sent in the authorization request.',
          steps: [
            'Do not share auth state across tabs.',
            'Check your PKCE/state implementation for race conditions.',
            'Ensure the state is stored and compared correctly on the callback.',
          ],
        },
      });
    }

    if (url.includes('error=invalid_request') && url.includes('code_challenge')) {
      candidates.push({
        dedupKey: `oidc:pkce-missing`,
        eventId: event.id,
        issue: {
          id: 'oidc:pkce-missing',
          severity: 'error',
          category: 'oidc',
          title: 'PKCE challenge missing',
          description: 'The authorization request was missing the required PKCE code_challenge.',
          steps: [
            'Ensure the SDK is configured with PKCE enabled.',
            'Verify the client application requires PKCE in your AS client configuration.',
          ],
        },
      });
    }

    if (url.includes('error=invalid_request') && url.includes('redirect_uri')) {
      candidates.push({
        dedupKey: `oidc:redirect-uri-mismatch`,
        eventId: event.id,
        issue: {
          id: 'oidc:redirect-uri-mismatch',
          severity: 'error',
          category: 'oidc',
          title: 'Redirect URI mismatch',
          description:
            'The redirect URI in the request does not match any URI registered in the AS client.',
          steps: [
            'Register the exact redirect URI used by your app in the AS client configuration.',
            'Ensure no trailing slashes or protocol mismatches.',
          ],
        },
      });
    }
  }

  return candidates;
}

// ─── OIDC Flow rules (network-first) ──────────────────────────────────────────

function collectOidcFlowIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];
  const semanticEvents = events.filter((e) => e.oidcSemantics);

  const authorizeEvents = semanticEvents.filter((e) => e.oidcSemantics?.oidcPhase === 'authorize');
  const tokenEvents = semanticEvents.filter((e) => e.oidcSemantics?.oidcPhase === 'token');

  // Flow-level checks: only warn if NO authorize event in the flow has PKCE
  const anyAuthorizeHasPkce = authorizeEvents.some((e) => e.oidcSemantics?.pkce);
  const anyAuthorizeHasPar = authorizeEvents.some((e) => e.oidcSemantics?.par);

  if (authorizeEvents.length > 0 && !anyAuthorizeHasPkce && !anyAuthorizeHasPar) {
    // Pick the most specific authorize event (has clientId, or first one)
    const representative =
      authorizeEvents.find((e) => e.oidcSemantics?.clientId) ?? authorizeEvents[0];
    candidates.push({
      dedupKey: `oidc:missing-pkce`,
      eventId: representative.id,
      issue: {
        id: 'oidc:missing-pkce',
        severity: 'warning',
        category: 'oidc-flow',
        title: 'Authorization request without PKCE',
        description:
          'The authorization request does not include a PKCE code_challenge. PKCE is recommended for all OAuth clients.',
        steps: [
          'Add code_challenge and code_challenge_method to the authorization request.',
          'Use S256 as the code_challenge_method.',
        ],
      },
    });
  }

  // Per-event checks that only apply to the "real" authorize request (one with clientId or query params)
  for (const event of authorizeEvents) {
    const sem = event.oidcSemantics!;
    if (event.data._tag !== 'network') continue;
    const url = event.data.url;

    // Skip events that don't look like real authorize requests
    // (no clientId detected and no query params with scope/response_type)
    if (!sem.clientId && !url.includes('response_type=')) continue;

    // Nonce missing with openid scope
    if (url.includes('scope=') && url.includes('openid') && !sem.nonce) {
      candidates.push({
        dedupKey: `oidc:nonce-missing`,
        eventId: event.id,
        issue: {
          id: 'oidc:nonce-missing',
          severity: 'warning',
          category: 'oidc-flow',
          title: 'Missing nonce for OpenID Connect',
          description:
            'The authorization request includes the openid scope but no nonce parameter.',
          steps: [
            'Include a unique nonce value in the authorization request.',
            'Verify the nonce in the returned id_token to prevent replay attacks.',
          ],
        },
      });
    }

    // Implicit flow detection
    if (url.includes('response_type=token') || url.includes('response_type=id_token')) {
      candidates.push({
        dedupKey: `oidc:implicit-flow`,
        eventId: event.id,
        issue: {
          id: 'oidc:implicit-flow',
          severity: 'warning',
          category: 'oidc-flow',
          title: 'Implicit flow detected',
          description:
            'The response_type includes "token" or "id_token", indicating the implicit flow. This is discouraged in favor of the authorization code flow with PKCE.',
          steps: [
            'Switch to response_type=code with PKCE.',
            'The implicit flow exposes tokens in the URL fragment.',
          ],
        },
      });
    }
  }

  for (const event of tokenEvents) {
    const sem = event.oidcSemantics!;

    // Token request without code_verifier when authorize used PKCE
    if (sem.grantType === 'authorization_code' && !sem.pkce?.hasVerifier) {
      if (anyAuthorizeHasPkce) {
        candidates.push({
          dedupKey: `oidc:missing-pkce-verifier`,
          eventId: event.id,
          issue: {
            id: 'oidc:missing-pkce-verifier',
            severity: 'error',
            category: 'oidc-flow',
            title: 'Missing PKCE code_verifier',
            description:
              'The token request is missing code_verifier but the authorization request included code_challenge.',
            steps: [
              'Include the code_verifier in the token request body.',
              'The code_verifier must match the code_challenge sent in the authorization request.',
            ],
          },
        });
      }
    }
  }

  // Detect same auth code used multiple times
  const codeUsage = new Map<string, string[]>();
  for (const event of tokenEvents) {
    if (
      event.data._tag === 'network' &&
      typeof event.data.requestBody === 'object' &&
      event.data.requestBody !== null
    ) {
      const body = event.data.requestBody as Record<string, unknown>;
      const code = body['code'];
      if (typeof code === 'string') {
        const existing = codeUsage.get(code) ?? [];
        codeUsage.set(code, [...existing, event.id]);
      }
    }
  }
  for (const [code, eventIds] of codeUsage) {
    if (eventIds.length > 1) {
      candidates.push({
        dedupKey: `oidc:expired-code:${code}`,
        eventId: eventIds[1],
        issue: {
          id: 'oidc:expired-code',
          severity: 'error',
          category: 'oidc-flow',
          title: 'Authorization code reused',
          description:
            'The same authorization code was used in multiple token requests. Authorization codes are single-use.',
          steps: [
            'Ensure the auth code is only used once.',
            'Restart the flow to obtain a new authorization code.',
          ],
          relevantData: { code: code.slice(0, 16) + '...' },
        },
      });
    }
  }

  return candidates;
}

// ─── DPoP rules ───────────────────────────────────────────────────────────────

function collectDpopIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];

  for (const event of events) {
    const sem = event.oidcSemantics;
    if (!sem?.dpop) continue;

    if (event.data._tag !== 'network') continue;
    const { data } = event;

    // Check DPoP proof structure
    if (sem.dpop.proofJwt) {
      const payload = decodeJwtPayload(sem.dpop.proofJwt);
      if (payload) {
        const requiredClaims = ['htm', 'htu', 'iat', 'jti'];
        const missing = requiredClaims.filter((c) => !(c in payload));
        if (missing.length > 0) {
          candidates.push({
            dedupKey: `dpop:invalid-structure:${event.id}`,
            eventId: event.id,
            issue: {
              id: 'dpop:invalid-structure',
              severity: 'error',
              category: 'dpop',
              title: 'DPoP proof missing required claims',
              description: `The DPoP proof JWT is missing: ${missing.join(', ')}.`,
              steps: [
                'Include all required claims: htm, htu, iat, jti.',
                'Add ath when using DPoP with resource requests.',
              ],
              relevantData: { 'missing-claims': missing.join(', ') },
            },
          });
        }

        // htm mismatch
        if (typeof payload['htm'] === 'string' && payload['htm'] !== data.method) {
          candidates.push({
            dedupKey: `dpop:method-mismatch:${event.id}`,
            eventId: event.id,
            issue: {
              id: 'dpop:method-mismatch',
              severity: 'error',
              category: 'dpop',
              title: 'DPoP method mismatch',
              description: `DPoP proof htm="${payload['htm']}" does not match actual method "${data.method}".`,
              steps: ['The htm claim must match the HTTP method of the request.'],
              relevantData: { htm: payload['htm'] as string, method: data.method },
            },
          });
        }

        // htu mismatch
        if (typeof payload['htu'] === 'string') {
          const htu = payload['htu'] as string;
          const urlNoQuery = data.url.split('?')[0];
          if (htu !== urlNoQuery && htu !== data.url) {
            candidates.push({
              dedupKey: `dpop:uri-mismatch:${event.id}`,
              eventId: event.id,
              issue: {
                id: 'dpop:uri-mismatch',
                severity: 'error',
                category: 'dpop',
                title: 'DPoP URI mismatch',
                description: 'The DPoP proof htu does not match the request URL.',
                steps: [
                  'The htu claim must match the URL of the request (without query/fragment).',
                ],
                relevantData: { htu, url: urlNoQuery },
              },
            });
          }
        }
      }
    }

    // DPoP nonce required error
    if (sem.dpop.nonce && data.status === 400) {
      const body = data.responseBody as Record<string, unknown> | null;
      if (body && body['error'] === 'use_dpop_nonce') {
        candidates.push({
          dedupKey: `dpop:nonce-required:${event.id}`,
          eventId: event.id,
          issue: {
            id: 'dpop:nonce-required',
            severity: 'info',
            category: 'dpop',
            title: 'DPoP nonce required',
            description:
              'The server requires a DPoP nonce. The client should retry with the provided nonce.',
            steps: [
              'Include the DPoP-Nonce header value in the next DPoP proof.',
              'This is expected behavior for server nonce enforcement.',
            ],
            relevantData: { nonce: sem.dpop.nonce },
          },
        });
      }
    }
  }

  // Check for token requests to DPoP servers missing DPoP header
  const dpopServers = new Set<string>();
  for (const event of events) {
    if (event.oidcSemantics?.dpop?.tokenType?.toLowerCase() === 'dpop') {
      if (event.data._tag === 'network') {
        try {
          dpopServers.add(new URL(event.data.url).origin);
        } catch {
          // ignore invalid URLs
        }
      }
    }
  }
  for (const event of events) {
    if (event.data._tag !== 'network') continue;
    if (event.oidcSemantics?.oidcPhase !== 'token') continue;
    if (event.data.requestHeaders['dpop']) continue;
    try {
      const origin = new URL(event.data.url).origin;
      if (dpopServers.has(origin)) {
        candidates.push({
          dedupKey: `dpop:missing-proof:${event.id}`,
          eventId: event.id,
          issue: {
            id: 'dpop:missing-proof',
            severity: 'warning',
            category: 'dpop',
            title: 'Missing DPoP proof',
            description:
              'This token endpoint previously issued DPoP tokens but this request lacks a DPoP header.',
            steps: ['Include a DPoP proof JWT in the DPoP header.'],
          },
        });
      }
    } catch {
      // ignore
    }
  }

  return candidates;
}

// ─── PAR rules ────────────────────────────────────────────────────────────────

function collectParIssues(events: readonly AuthEvent[]): IssueCandidate[] {
  const candidates: IssueCandidate[] = [];

  for (const event of events) {
    const sem = event.oidcSemantics;
    if (!sem) continue;

    // PAR response missing request_uri
    if (
      sem.oidcPhase === 'par' &&
      !sem.par?.requestUri &&
      event.data._tag === 'network' &&
      event.data.status < 400
    ) {
      candidates.push({
        dedupKey: `par:missing-request-uri:${event.id}`,
        eventId: event.id,
        issue: {
          id: 'par:missing-request-uri',
          severity: 'error',
          category: 'par',
          title: 'PAR response missing request_uri',
          description: 'The PAR endpoint returned a successful response but without a request_uri.',
          steps: [
            'Check the PAR endpoint configuration.',
            'The response must include request_uri and expires_in.',
          ],
        },
      });
    }

    // Authorize with both request_uri AND inline params
    if (sem.oidcPhase === 'authorize' && sem.par?.requestUri && event.data._tag === 'network') {
      const url = event.data.url;
      const hasInlineParams =
        url.includes('client_id=') || url.includes('redirect_uri=') || url.includes('scope=');
      if (hasInlineParams) {
        candidates.push({
          dedupKey: `par:inline-params-with-request-uri:${event.id}`,
          eventId: event.id,
          issue: {
            id: 'par:inline-params-with-request-uri',
            severity: 'warning',
            category: 'par',
            title: 'Inline params with request_uri',
            description:
              'The authorization request includes both request_uri and inline parameters. Per RFC 9126, only request_uri and client_id should be present.',
            steps: [
              'Remove inline parameters (scope, redirect_uri, etc.) when using request_uri.',
              'Only include request_uri and client_id in the authorization URL.',
            ],
          },
        });
      }
    }
  }

  return candidates;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

export function runFlowRules(events: readonly AuthEvent[]): FlowIssue[] {
  const candidates: IssueCandidate[] = [
    ...collectCorsIssues(events),
    ...collectTokenIssues(events),
    ...collectFlowConfigIssues(events),
    ...collectOidcIssues(events),
    ...collectOidcFlowIssues(events),
    ...collectDpopIssues(events),
    ...collectParIssues(events),
  ];

  return mergeByDedupKey(candidates).sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}

export function runEventRules(event: AuthEvent, allEvents: readonly AuthEvent[]): EventIssue[] {
  const issues: EventIssue[] = [];

  if (event.data._tag === 'network') {
    const { data } = event;

    if (data.status === 0 && event.flags.isCors) {
      const origin = data.requestHeaders['origin'] ?? '';
      issues.push({
        severity: 'error',
        title: 'Network failure (status 0)',
        description:
          'The request never reached the server. This is almost always a CORS preflight rejection.',
        steps: [
          `Your AS must include this origin in allowed origins: ${origin || '(unknown)'}`,
          'If using credentials, wildcard (*) is not allowed.',
          'Check the OPTIONS preflight in the Network tab.',
        ],
        relevantData: {
          'access-control-allow-origin':
            data.responseHeaders['access-control-allow-origin'] ?? '(not present)',
          'access-control-allow-credentials':
            data.responseHeaders['access-control-allow-credentials'] ?? '(not present)',
        },
      });
    }

    // Expired JWT in request headers
    const expiredJwts = findExpiredJwtsInHeaders(data.requestHeaders);
    for (const token of expiredJwts) {
      const payload = decodeJwtPayload(token);
      const exp = payload && typeof payload['exp'] === 'number' ? payload['exp'] : null;
      issues.push({
        severity: 'error',
        title: 'Token expired',
        description: 'A JWT in the request headers has an expired exp claim.',
        steps: ['Restart the flow to obtain a fresh token.', 'Check your SDK token refresh logic.'],
        relevantData: exp ? { exp: new Date(exp * 1000).toISOString() } : undefined,
      });
    }

    const hasOriginHeader = 'origin' in data.requestHeaders;
    const allowOrigin = data.responseHeaders['access-control-allow-origin'] ?? '';
    if (hasOriginHeader && !allowOrigin && data.status !== 0 && event.flags.isCors) {
      issues.push({
        severity: 'error',
        title: 'Missing CORS header',
        description: 'The server response is missing Access-Control-Allow-Origin.',
        steps: [`Add ${data.requestHeaders['origin']} to allowed origins on your auth server.`],
        relevantData: { 'missing-header': 'access-control-allow-origin' },
      });
    }
  }

  if (event.data._tag === 'sdk') {
    const { data } = event;
    if (data.nodeStatus === 'error' || data.nodeStatus === 'failure') {
      const nodeName = data.nodeName ?? '';
      issues.push({
        severity: 'error',
        title: nodeName ? `Node error: ${nodeName}` : 'Node error',
        description: `Node returned status "${data.nodeStatus}".`,
        steps: [
          'Check DaVinci connector configuration.',
          'Review the error code in the SDK State tab.',
        ],
        relevantData: data.error
          ? { code: data.error.code, message: data.error.message }
          : undefined,
      });
    }
  }

  // Suppress unused-parameter warning — allEvents available for future cross-event per-event rules
  void allEvents;

  return issues;
}

export function runDiagnosis(events: readonly AuthEvent[]): DiagnosisResult {
  const issues = runFlowRules(events);

  const annotatedEvents = new Map<string, EventIssue[]>();
  for (const event of events) {
    const eventIssues = runEventRules(event, events);
    if (eventIssues.length > 0) {
      annotatedEvents.set(event.id, eventIssues);
    }
  }

  const flowHealth = issues.some((i) => i.severity === 'error')
    ? 'error'
    : issues.some((i) => i.severity === 'warning')
      ? 'warning'
      : 'healthy';

  return { issues, annotatedEvents, flowHealth };
}
