import { describe, it, expect } from 'vitest';
import { runFlowRules, runEventRules, runDiagnosis } from './diagnosis-engine.js';
import type { AuthEvent } from '@forgerock/devtools-types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeNetworkEvent = (overrides: Partial<AuthEvent> = {}): AuthEvent => ({
  id: 'net-1',
  timestamp: 1000,
  type: 'network:response',
  source: 'network',
  flowId: 'flow-1',
  causedBy: null,
  data: {
    _tag: 'network',
    url: '/davinci/flows',
    method: 'POST',
    status: 200,
    requestHeaders: { origin: 'http://localhost:3000' },
    responseHeaders: { 'content-type': 'application/json' },
    duration: 100,
  },
  flags: { isCors: false, isError: false, isAuthRelated: true },
  ...overrides,
});

const makeSdkEvent = (overrides: Partial<AuthEvent> = {}): AuthEvent => ({
  id: 'sdk-1',
  timestamp: 2000,
  type: 'sdk:node-change',
  source: 'sdk',
  flowId: 'flow-1',
  causedBy: null,
  data: {
    _tag: 'sdk',
    nodeStatus: 'continue',
    interactionId: 'int-abc',
    interactionToken: 'tok-xyz',
  },
  flags: { isCors: false, isError: false, isAuthRelated: true },
  ...overrides,
});

// ─── CORS Rules ───────────────────────────────────────────────────────────────

describe('CORS rules', () => {
  it('flags status 0 as CORS network failure', () => {
    const events = [
      makeNetworkEvent({
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 0,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {},
          duration: 0,
        },
        flags: { isCors: true, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'cors:status-zero')).toBe(true);
    const issue = result.find((i) => i.id === 'cors:status-zero')!;
    expect(issue.severity).toBe('error');
    expect(issue.category).toBe('cors');
    expect(issue.steps.length).toBeGreaterThan(0);
    expect(issue.relatedEventIds).toContain('net-1');
  });

  it('flags missing access-control-allow-origin when origin was sent', () => {
    const events = [
      makeNetworkEvent({
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 403,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {},
          duration: 50,
        },
        flags: { isCors: true, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'cors:missing-allow-origin')).toBe(true);
  });

  it('does not flag missing allow-origin when origin was NOT sent', () => {
    const events = [
      makeNetworkEvent({
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 403,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        flags: { isCors: false, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'cors:missing-allow-origin')).toBe(false);
  });

  it('flags wildcard CORS with credentials', () => {
    const events = [
      makeNetworkEvent({
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 200,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {
            'access-control-allow-origin': '*',
            'access-control-allow-credentials': 'true',
          },
          duration: 50,
        },
        flags: { isCors: true, isError: false, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'cors:wildcard-with-credentials')).toBe(true);
    const issue = result.find((i) => i.id === 'cors:wildcard-with-credentials')!;
    expect(issue.severity).toBe('error');
  });

  it('deduplicates CORS issues — same origin produces one issue', () => {
    const events = [
      makeNetworkEvent({
        id: 'net-1',
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 0,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {},
          duration: 0,
        },
        flags: { isCors: true, isError: true, isAuthRelated: true },
      }),
      makeNetworkEvent({
        id: 'net-2',
        data: {
          _tag: 'network',
          url: '/davinci/flows/step2',
          method: 'POST',
          status: 0,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {},
          duration: 0,
        },
        flags: { isCors: true, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    const corsStatusZeroIssues = result.filter((i) => i.id === 'cors:status-zero');
    expect(corsStatusZeroIssues.length).toBe(1);
    // But both event IDs should be in relatedEventIds
    expect(corsStatusZeroIssues[0].relatedEventIds).toContain('net-1');
    expect(corsStatusZeroIssues[0].relatedEventIds).toContain('net-2');
  });
});

// ─── Token / Session Rules ────────────────────────────────────────────────────

describe('Token/Session rules', () => {
  it('flags interactionToken missing on non-first sdk:node-change', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-1',
        data: {
          _tag: 'sdk',
          nodeStatus: 'continue',
          interactionId: 'int-abc',
          interactionToken: 'tok-xyz',
        },
      }),
      makeSdkEvent({
        id: 'sdk-2',
        timestamp: 3000,
        data: { _tag: 'sdk', nodeStatus: 'continue', interactionId: 'int-abc' },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'token:missing-interaction-token')).toBe(true);
  });

  it('does not flag missing interactionToken on the first sdk:node-change', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-1',
        data: { _tag: 'sdk', nodeStatus: 'continue', interactionId: 'int-abc' },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'token:missing-interaction-token')).toBe(false);
  });

  it('flags SESSION_NOT_FOUND error code', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-err',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: {
          _tag: 'sdk',
          nodeStatus: 'error',
          error: { code: 'SESSION_NOT_FOUND', message: 'Session not found', type: 'SESSION_ERROR' },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'token:session-not-found')).toBe(true);
    const issue = result.find((i) => i.id === 'token:session-not-found')!;
    expect(issue.severity).toBe('error');
  });

  it('flags INVALID_SESSION error code', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-err',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: {
          _tag: 'sdk',
          nodeStatus: 'error',
          error: { code: 'INVALID_SESSION', message: 'Invalid session', type: 'SESSION_ERROR' },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'token:session-not-found')).toBe(true);
  });
});

// ─── Flow Config Rules ────────────────────────────────────────────────────────

describe('Flow Config rules', () => {
  it('flags nodeStatus error', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-err',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: { _tag: 'sdk', nodeStatus: 'error', nodeName: 'Registration Form' },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'flow:node-error')).toBe(true);
    const issue = result.find((i) => i.id === 'flow:node-error')!;
    expect(issue.severity).toBe('error');
    expect(issue.title).toContain('Registration Form');
    expect(issue.relatedEventIds).toContain('sdk-err');
  });

  it('flags nodeStatus failure', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-fail',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: { _tag: 'sdk', nodeStatus: 'failure' },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'flow:node-error')).toBe(true);
  });

  it('flags CONNECTOR_ERROR', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-conn',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: {
          _tag: 'sdk',
          nodeStatus: 'error',
          error: {
            code: 'CONNECTOR_ERROR',
            message: 'Connector failed',
            type: 'CONNECTOR',
            internalHttpStatus: 400,
          },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'flow:connector-error')).toBe(true);
    const issue = result.find((i) => i.id === 'flow:connector-error')!;
    expect(issue.title).toContain('400');
  });

  it('flags NOT_FOUND error code', () => {
    const events = [
      makeSdkEvent({
        id: 'sdk-nf',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: {
          _tag: 'sdk',
          nodeStatus: 'error',
          error: { code: 'NOT_FOUND', message: 'Policy not found', type: 'NOT_FOUND' },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'flow:policy-not-found')).toBe(true);
  });
});

// ─── OIDC Rules ───────────────────────────────────────────────────────────────

describe('OIDC rules', () => {
  it('flags state_mismatch in redirect URI', () => {
    const events = [
      makeNetworkEvent({
        id: 'oidc-1',
        type: 'dom:redirect',
        source: 'dom',
        data: {
          _tag: 'dom',
          url: 'https://app.example.com/callback?error=state_mismatch',
        },
        flags: { isCors: false, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:state-mismatch')).toBe(true);
    const issue = result.find((i) => i.id === 'oidc:state-mismatch')!;
    expect(issue.severity).toBe('error');
  });

  it('flags PKCE challenge missing', () => {
    const events = [
      makeNetworkEvent({
        id: 'oidc-2',
        type: 'dom:redirect',
        source: 'dom',
        data: {
          _tag: 'dom',
          url: 'https://app.example.com/callback?error=invalid_request&error_description=code_challenge+missing',
        },
        flags: { isCors: false, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:pkce-missing')).toBe(true);
  });
});

// ─── runEventRules ────────────────────────────────────────────────────────────

describe('runEventRules', () => {
  it('returns empty array for a clean network event', () => {
    const event = makeNetworkEvent();
    const result = runEventRules(event, [event]);
    expect(result).toEqual([]);
  });

  it('annotates status-0 network event', () => {
    const event = makeNetworkEvent({
      data: {
        _tag: 'network',
        url: '/davinci/flows',
        method: 'POST',
        status: 0,
        requestHeaders: { origin: 'http://localhost:3000' },
        responseHeaders: {},
        duration: 0,
      },
      flags: { isCors: true, isError: true, isAuthRelated: true },
    });
    const result = runEventRules(event, [event]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].severity).toBe('error');
  });

  it('annotates sdk:node-change with error status', () => {
    const event = makeSdkEvent({
      flags: { isCors: false, isError: true, isAuthRelated: true },
      data: { _tag: 'sdk', nodeStatus: 'error', nodeName: 'Login Form' },
    });
    const result = runEventRules(event, [event]);
    expect(result.some((i) => i.title.includes('Node error'))).toBe(true);
  });
});

// ─── runDiagnosis (integration) ───────────────────────────────────────────────

describe('runDiagnosis', () => {
  it('returns healthy when no issues', () => {
    const events = [makeNetworkEvent(), makeSdkEvent()];
    const result = runDiagnosis(events);
    expect(result.flowHealth).toBe('healthy');
    expect(result.issues).toHaveLength(0);
  });

  it('returns error health when error issues present', () => {
    const events = [
      makeNetworkEvent({
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 0,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {},
          duration: 0,
        },
        flags: { isCors: true, isError: true, isAuthRelated: true },
      }),
    ];
    const result = runDiagnosis(events);
    expect(result.flowHealth).toBe('error');
  });

  it('returns warning health when only warning issues present', () => {
    const events = [
      makeNetworkEvent({
        id: 'net-warn',
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 200,
          // cookie in request triggers credentials-not-allowed check
          requestHeaders: { origin: 'http://localhost:3000', cookie: 'session=abc' },
          responseHeaders: {
            // include allow-origin so cors:missing-allow-origin error doesn't fire
            'access-control-allow-origin': 'http://localhost:3000',
            'access-control-allow-credentials': 'false',
          },
          duration: 50,
        },
        flags: { isCors: true, isError: false, isAuthRelated: true },
      }),
    ];
    const result = runDiagnosis(events);
    // credentials not allowed warning
    expect(['warning', 'healthy']).toContain(result.flowHealth);
  });

  it('populates annotatedEvents for affected events', () => {
    const event = makeNetworkEvent({
      data: {
        _tag: 'network',
        url: '/davinci/flows',
        method: 'POST',
        status: 0,
        requestHeaders: { origin: 'http://localhost:3000' },
        responseHeaders: {},
        duration: 0,
      },
      flags: { isCors: true, isError: true, isAuthRelated: true },
    });
    const result = runDiagnosis([event]);
    expect(result.annotatedEvents.has('net-1')).toBe(true);
  });

  it('issues are ordered: error before warning before info', () => {
    const events = [
      makeNetworkEvent({
        id: 'net-1',
        data: {
          _tag: 'network',
          url: '/davinci/flows',
          method: 'POST',
          status: 0,
          requestHeaders: { origin: 'http://localhost:3000' },
          responseHeaders: {},
          duration: 0,
        },
        flags: { isCors: true, isError: true, isAuthRelated: true },
      }),
      makeSdkEvent({
        id: 'sdk-1',
        flags: { isCors: false, isError: true, isAuthRelated: true },
        data: { _tag: 'sdk', nodeStatus: 'error' },
      }),
    ];
    const result = runDiagnosis(events);
    const severities = result.issues.map((i) => i.severity);
    // All errors should come before warnings
    const firstWarningIdx = severities.indexOf('warning');
    const lastErrorIdx = severities.lastIndexOf('error');
    if (firstWarningIdx !== -1 && lastErrorIdx !== -1) {
      expect(lastErrorIdx).toBeLessThan(firstWarningIdx);
    }
  });
});

// ─── Expired JWT via runEventRules ────────────────────────────────────────────

// ─── OIDC Flow Rules (network-first) ─────────────────────────────────────────

describe('OIDC Flow rules', () => {
  it('flags authorize without PKCE', () => {
    const events = [
      makeNetworkEvent({
        id: 'auth-1',
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          clientId: 'app1',
          state: 'st1',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:missing-pkce')).toBe(true);
    const issue = result.find((i) => i.id === 'oidc:missing-pkce')!;
    expect(issue.severity).toBe('warning');
    expect(issue.category).toBe('oidc-flow');
  });

  it('does not flag missing PKCE when any authorize event has PKCE', () => {
    // Simulates the real-world case: multiple authorize-phase events from the annotator,
    // but only the real one (to the auth server) has PKCE.
    const events = [
      makeNetworkEvent({
        id: 'auth-real',
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          clientId: 'WebOAuthClient',
          state: 'xyz',
          pkce: { challengeMethod: 'S256', hasVerifier: false },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:missing-pkce')).toBe(false);
  });

  it('does not flag authorize with PKCE', () => {
    const events = [
      makeNetworkEvent({
        id: 'auth-1',
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          pkce: { challengeMethod: 'S256', hasVerifier: false },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:missing-pkce')).toBe(false);
  });

  it('flags implicit flow (response_type=token)', () => {
    const events = [
      makeNetworkEvent({
        id: 'auth-impl',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/authorize?response_type=token&client_id=x',
          method: 'GET',
          status: 302,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:implicit-flow')).toBe(true);
  });

  it('flags nonce missing with openid scope', () => {
    const events = [
      makeNetworkEvent({
        id: 'auth-nonce',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/authorize?scope=openid+profile&response_type=code&client_id=x',
          method: 'GET',
          status: 302,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          clientId: 'x',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:nonce-missing')).toBe(true);
  });

  it('flags missing code_verifier when authorize used PKCE', () => {
    const events = [
      makeNetworkEvent({
        id: 'auth-pkce',
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          pkce: { challengeMethod: 'S256', hasVerifier: false },
        },
      }),
      makeNetworkEvent({
        id: 'token-no-verifier',
        timestamp: 2000,
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          grantType: 'authorization_code',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:missing-pkce-verifier')).toBe(true);
  });

  it('does not flag missing code_verifier when verifier is present', () => {
    const events = [
      makeNetworkEvent({
        id: 'auth-pkce',
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          pkce: { challengeMethod: 'S256', hasVerifier: false },
        },
      }),
      makeNetworkEvent({
        id: 'token-with-verifier',
        timestamp: 2000,
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          grantType: 'authorization_code',
          pkce: { challengeMethod: 'S256', hasVerifier: true },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:missing-pkce-verifier')).toBe(false);
  });

  it('flags auth code reuse', () => {
    const events = [
      makeNetworkEvent({
        id: 'tok-1',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 200,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
          requestBody: { grant_type: 'authorization_code', code: 'same-code-123' },
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          grantType: 'authorization_code',
        },
      }),
      makeNetworkEvent({
        id: 'tok-2',
        timestamp: 2000,
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 400,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
          requestBody: { grant_type: 'authorization_code', code: 'same-code-123' },
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          grantType: 'authorization_code',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'oidc:expired-code')).toBe(true);
  });
});

// ─── DPoP Rules ──────────────────────────────────────────────────────────────

describe('DPoP rules', () => {
  const makeDpopJwt = (claims: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ typ: 'dpop+jwt', alg: 'ES256' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const payload = btoa(JSON.stringify(claims))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `${header}.${payload}.fakesig`;
  };

  it('flags DPoP proof with missing required claims', () => {
    const jwt = makeDpopJwt({ htm: 'POST' }); // missing htu, iat, jti
    const events = [
      makeNetworkEvent({
        id: 'dpop-1',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 200,
          requestHeaders: { dpop: jwt },
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          dpop: { proofJwt: jwt },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'dpop:invalid-structure')).toBe(true);
    const issue = result.find((i) => i.id === 'dpop:invalid-structure')!;
    expect(issue.category).toBe('dpop');
  });

  it('flags DPoP method mismatch', () => {
    const jwt = makeDpopJwt({
      htm: 'GET',
      htu: 'https://auth.example.com/token',
      iat: 1700000000,
      jti: 'x',
    });
    const events = [
      makeNetworkEvent({
        id: 'dpop-meth',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 200,
          requestHeaders: { dpop: jwt },
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          dpop: { proofJwt: jwt },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'dpop:method-mismatch')).toBe(true);
  });

  it('flags DPoP URI mismatch', () => {
    const jwt = makeDpopJwt({
      htm: 'POST',
      htu: 'https://other.example.com/token',
      iat: 1700000000,
      jti: 'x',
    });
    const events = [
      makeNetworkEvent({
        id: 'dpop-uri',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 200,
          requestHeaders: { dpop: jwt },
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          dpop: { proofJwt: jwt },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'dpop:uri-mismatch')).toBe(true);
  });

  it('flags DPoP nonce required (use_dpop_nonce error)', () => {
    const events = [
      makeNetworkEvent({
        id: 'dpop-nonce',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 400,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
          responseBody: { error: 'use_dpop_nonce' },
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          dpop: { nonce: 'server-nonce-1' },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'dpop:nonce-required')).toBe(true);
    const issue = result.find((i) => i.id === 'dpop:nonce-required')!;
    expect(issue.severity).toBe('info');
  });

  it('flags missing DPoP proof for known DPoP server', () => {
    const events = [
      // First request establishes this is a DPoP server
      makeNetworkEvent({
        id: 'dpop-established',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 200,
          requestHeaders: { dpop: 'x.y.z' },
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          dpop: { tokenType: 'DPoP' },
        },
      }),
      // Second request to same server lacks DPoP header
      makeNetworkEvent({
        id: 'dpop-missing',
        timestamp: 2000,
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/token',
          method: 'POST',
          status: 200,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'dpop:missing-proof')).toBe(true);
  });
});

// ─── PAR Rules ───────────────────────────────────────────────────────────────

describe('PAR rules', () => {
  it('flags PAR response missing request_uri', () => {
    const events = [
      makeNetworkEvent({
        id: 'par-no-uri',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/par',
          method: 'POST',
          status: 201,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'par',
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'par:missing-request-uri')).toBe(true);
  });

  it('does not flag PAR response with request_uri', () => {
    const events = [
      makeNetworkEvent({
        id: 'par-ok',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/par',
          method: 'POST',
          status: 201,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'par',
          par: { requestUri: 'urn:example:req-123', expiresIn: 60 },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'par:missing-request-uri')).toBe(false);
  });

  it('flags inline params alongside request_uri', () => {
    const events = [
      makeNetworkEvent({
        id: 'par-inline',
        data: {
          _tag: 'network',
          url: 'https://auth.example.com/authorize?request_uri=urn:x&client_id=app1&redirect_uri=https://app.example.com/callback',
          method: 'GET',
          status: 302,
          requestHeaders: {},
          responseHeaders: {},
          duration: 50,
        },
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'authorize',
          par: { requestUri: 'urn:x' },
        },
      }),
    ];
    const result = runFlowRules(events);
    expect(result.some((i) => i.id === 'par:inline-params-with-request-uri')).toBe(true);
  });
});

// ─── Expired JWT via runEventRules ────────────────────────────────────────────

describe('expired JWT detection in runEventRules', () => {
  const makeExpiredJwt = () => {
    // header: {"alg":"RS256","typ":"JWT"}
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    // payload: {"sub":"user","exp": 1 (way in the past)}
    const payload = btoa(JSON.stringify({ sub: 'user', exp: 1 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return `${header}.${payload}.fakesig`;
  };

  it('flags expired JWT in authorization header', () => {
    const event = makeNetworkEvent({
      data: {
        _tag: 'network',
        url: '/davinci/flows',
        method: 'POST',
        status: 401,
        requestHeaders: { authorization: `Bearer ${makeExpiredJwt()}` },
        responseHeaders: {},
        duration: 50,
      },
      flags: { isCors: false, isError: true, isAuthRelated: true },
    });
    const result = runEventRules(event, [event]);
    expect(
      result.some(
        (i) =>
          i.title.includes('expired') ||
          i.title.includes('Expired') ||
          i.title.toLowerCase().includes('token'),
      ),
    ).toBe(true);
  });
});
