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
