import type { AuthEvent } from '@forgerock/devtools-types';

export type Severity = 'error' | 'warning' | 'info';

export interface FlowIssue {
  id: string;
  severity: Severity;
  category: 'cors' | 'token' | 'flow-config' | 'oidc';
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

// ─── JWT helpers ──────────────────────────────────────────────────────────────

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractJwt(value: string): string | null {
  const bearer = value.match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i);
  if (bearer) return bearer[1];
  if (JWT_PATTERN.test(value)) return value;
  return null;
}

function findExpiredJwtsInHeaders(headers: Record<string, string>): string[] {
  const expired: string[] = [];
  for (const value of Object.values(headers)) {
    const token = extractJwt(value);
    if (!token) continue;
    const payload = decodeJwtPayload(token);
    if (payload && typeof payload['exp'] === 'number' && payload['exp'] * 1000 < Date.now()) {
      expired.push(token);
    }
  }
  return expired;
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

// ─── Public API ───────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

export function runFlowRules(events: readonly AuthEvent[]): FlowIssue[] {
  const candidates: IssueCandidate[] = [
    ...collectCorsIssues(events),
    ...collectTokenIssues(events),
    ...collectFlowConfigIssues(events),
    ...collectOidcIssues(events),
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
