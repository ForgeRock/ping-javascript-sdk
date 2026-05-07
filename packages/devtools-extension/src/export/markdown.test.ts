import { describe, expect, it } from 'vitest';
import { renderFlowMarkdown } from './markdown.js';
import type { FlowState, AuthEvent } from '@forgerock/devtools-types';
import type { DiagnosisResult } from '../background/diagnosis-engine.js';

const baseFlags = { isCors: false, isError: false, isAuthRelated: true };

const networkEvent: AuthEvent = {
  id: 'e1',
  timestamp: 1000,
  type: 'network:response',
  source: 'network',
  flowId: 'flow-abcd1234',
  causedBy: null,
  flags: baseFlags,
  data: {
    _tag: 'network',
    url: 'https://auth.example.com/davinci/connections',
    method: 'POST',
    status: 200,
    requestHeaders: {},
    responseHeaders: {},
    duration: 120,
  },
};

const sdkEvent: AuthEvent = {
  id: 'e2',
  timestamp: 1120,
  type: 'sdk:node-change',
  source: 'sdk',
  flowId: 'flow-abcd1234',
  causedBy: null,
  flags: baseFlags,
  data: { _tag: 'sdk', nodeStatus: 'continue', nodeName: 'UsernamePassword' },
};

function makeFlowState(events: AuthEvent[]): FlowState {
  return {
    flowId: 'flow-abcd1234',
    capturedAt: '2026-05-08T14:30:00.000Z',
    events,
    summary: { nodeCount: 1, errorCount: 0, corsFlags: [], duration: 120, sdkConnected: true },
    lastSdkEventId: null,
  };
}

describe('renderFlowMarkdown', () => {
  it('renders header with flow ID prefix and health status', () => {
    const md = renderFlowMarkdown(makeFlowState([networkEvent, sdkEvent]), null);
    expect(md).toContain('## Flow: flow-abc');
    expect(md).toContain('HEALTHY');
  });

  it('renders event table with relative timestamps', () => {
    const md = renderFlowMarkdown(makeFlowState([networkEvent, sdkEvent]), null);
    expect(md).toContain('+0ms');
    expect(md).toContain('+120ms');
    expect(md).toContain('network:response');
    expect(md).toContain('sdk:node-change');
  });

  it('renders detail columns for network events', () => {
    const md = renderFlowMarkdown(makeFlowState([networkEvent]), null);
    expect(md).toContain('200');
    expect(md).toContain('POST /davinci/connections');
  });

  it('renders detail columns for SDK events', () => {
    const md = renderFlowMarkdown(makeFlowState([sdkEvent]), null);
    expect(md).toContain('continue');
    expect(md).toContain('UsernamePassword');
  });

  it('omits diagnosis section when healthy', () => {
    const md = renderFlowMarkdown(makeFlowState([networkEvent]), null);
    expect(md).not.toContain('### Diagnosis');
  });

  it('renders diagnosis section when issues exist', () => {
    const diagnosis: DiagnosisResult = {
      flowHealth: 'error',
      issues: [
        {
          id: 'cors:status-zero',
          severity: 'error',
          category: 'cors',
          title: 'Network failure (status 0)',
          description: 'The request never reached the server.',
          steps: ['Add origin to allowed origins.', 'Check preflight.'],
          relatedEventIds: ['e1'],
        },
      ],
      annotatedEvents: new Map(),
    };
    const md = renderFlowMarkdown(makeFlowState([networkEvent]), diagnosis);
    expect(md).toContain('### Diagnosis');
    expect(md).toContain('ERROR');
    expect(md).toContain('Network failure (status 0)');
    expect(md).toContain('1. Add origin to allowed origins.');
    expect(md).toContain('2. Check preflight.');
  });

  it('renders journey event detail', () => {
    const journeyEvent: AuthEvent = {
      id: 'e3',
      timestamp: 1000,
      type: 'sdk:journey-step',
      source: 'sdk',
      flowId: 'flow-abcd1234',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'journey', stepType: 'Step', stage: 'UsernamePassword' },
    };
    const md = renderFlowMarkdown(makeFlowState([journeyEvent]), null);
    expect(md).toContain('Step');
    expect(md).toContain('UsernamePassword');
  });

  it('renders OIDC event detail', () => {
    const oidcEvent: AuthEvent = {
      id: 'e4',
      timestamp: 1000,
      type: 'sdk:oidc-state',
      source: 'sdk',
      flowId: 'flow-abcd1234',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'oidc', phase: 'exchange', status: 'success' },
    };
    const md = renderFlowMarkdown(makeFlowState([oidcEvent]), null);
    expect(md).toContain('success');
    expect(md).toContain('exchange');
  });

  it('preserves redaction markers in output', () => {
    const event: AuthEvent = {
      id: 'e5',
      timestamp: 1000,
      type: 'sdk:node-change',
      source: 'sdk',
      flowId: 'flow-abcd1234',
      causedBy: null,
      flags: baseFlags,
      data: {
        _tag: 'sdk',
        nodeStatus: 'continue',
        interactionToken: '<redacted:interaction_token>',
      },
    };
    const md = renderFlowMarkdown(makeFlowState([event]), null);
    expect(md).toContain('sdk:node-change');
  });
});
