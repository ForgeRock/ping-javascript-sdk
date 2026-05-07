import { describe, expect, it } from 'vitest';
import { redactFlowState } from './redact.js';
import type { FlowState, AuthEvent } from '@forgerock/devtools-types';

function makeFlowState(events: AuthEvent[]): FlowState {
  return {
    flowId: 'flow-1',
    capturedAt: '2026-05-08T14:30:00.000Z',
    events,
    summary: { nodeCount: 0, errorCount: 0, corsFlags: [], duration: 0, sdkConnected: false },
    lastSdkEventId: null,
  };
}

const baseFlags = { isCors: false, isError: false, isAuthRelated: true };

describe('redactFlowState', () => {
  it('redacts Authorization header', () => {
    const event: AuthEvent = {
      id: 'e1',
      timestamp: 1000,
      type: 'network:response',
      source: 'network',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: {
        _tag: 'network',
        url: '/token',
        method: 'POST',
        status: 200,
        requestHeaders: { authorization: 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.sig' },
        responseHeaders: {},
        duration: 100,
      },
    };
    const result = redactFlowState(makeFlowState([event]));
    const headers = (result.events[0].data as { requestHeaders: Record<string, string> })
      .requestHeaders;
    expect(headers.authorization).toBe('<redacted:bearer_token>');
  });

  it('redacts Cookie and Set-Cookie headers', () => {
    const event: AuthEvent = {
      id: 'e2',
      timestamp: 1000,
      type: 'network:response',
      source: 'network',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: {
        _tag: 'network',
        url: '/token',
        method: 'POST',
        status: 200,
        requestHeaders: { cookie: 'session=abc123' },
        responseHeaders: { 'set-cookie': 'session=def456; Path=/' },
        duration: 100,
      },
    };
    const result = redactFlowState(makeFlowState([event]));
    const data = result.events[0].data as {
      requestHeaders: Record<string, string>;
      responseHeaders: Record<string, string>;
    };
    expect(data.requestHeaders.cookie).toBe('<redacted:cookie>');
    expect(data.responseHeaders['set-cookie']).toBe('<redacted:cookie>');
  });

  it('redacts interactionToken in SDK data', () => {
    const event: AuthEvent = {
      id: 'e3',
      timestamp: 2000,
      type: 'sdk:node-change',
      source: 'sdk',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'sdk', nodeStatus: 'continue', interactionToken: 'secret-tok-xyz' },
    };
    const result = redactFlowState(makeFlowState([event]));
    const data = result.events[0].data as { interactionToken?: string };
    expect(data.interactionToken).toBe('<redacted:interaction_token>');
  });

  it('redacts authorization.code in SDK data', () => {
    const event: AuthEvent = {
      id: 'e4',
      timestamp: 2000,
      type: 'sdk:node-change',
      source: 'sdk',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'sdk', nodeStatus: 'success', authorization: { code: 'auth-code-secret' } },
    };
    const result = redactFlowState(makeFlowState([event]));
    const data = result.events[0].data as { authorization?: { code?: string } };
    expect(data.authorization?.code).toBe('<redacted:auth_code>');
  });

  it('redacts tokenId in journey data', () => {
    const event: AuthEvent = {
      id: 'e5',
      timestamp: 3000,
      type: 'sdk:journey-step',
      source: 'sdk',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'journey', stepType: 'LoginSuccess', tokenId: 'token-secret-123' },
    };
    const result = redactFlowState(makeFlowState([event]));
    const data = result.events[0].data as { tokenId?: string };
    expect(data.tokenId).toBe('<redacted:token_id>');
  });

  it('redacts token fields in response body objects', () => {
    const event: AuthEvent = {
      id: 'e6',
      timestamp: 1000,
      type: 'network:response',
      source: 'network',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: {
        _tag: 'network',
        url: '/token',
        method: 'POST',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 100,
        responseBody: { access_token: 'secret', refresh_token: 'secret2', scope: 'openid' },
      },
    };
    const result = redactFlowState(makeFlowState([event]));
    const body = (result.events[0].data as { responseBody?: Record<string, unknown> }).responseBody;
    expect(body?.access_token).toBe('<redacted:access_token>');
    expect(body?.refresh_token).toBe('<redacted:refresh_token>');
    expect(body?.scope).toBe('openid');
  });

  it('redacts sensitive callback values in journey data', () => {
    const event: AuthEvent = {
      id: 'e7',
      timestamp: 3000,
      type: 'sdk:journey-step',
      source: 'sdk',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: {
        _tag: 'journey',
        stepType: 'Step',
        callbacks: [
          {
            input: [{ name: 'IDToken1', value: 'user@example.com' }],
            output: [{ name: 'prompt', value: 'Username' }],
          },
          {
            input: [{ name: 'IDToken2_password', value: 's3cret' }],
            output: [{ name: 'prompt', value: 'Password' }],
          },
        ],
      },
    };
    const result = redactFlowState(makeFlowState([event]));
    const cbs = (
      result.events[0].data as {
        callbacks?: Array<{
          input: Array<{ name: string; value: unknown }>;
          output: Array<{ name: string; value: unknown }>;
        }>;
      }
    ).callbacks!;
    expect(cbs[0].input[0].value).toBe('user@example.com');
    expect(cbs[1].input[0].value).toBe('<redacted:callback_value>');
  });

  it('does not mutate the original flow state', () => {
    const event: AuthEvent = {
      id: 'e8',
      timestamp: 2000,
      type: 'sdk:node-change',
      source: 'sdk',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'sdk', nodeStatus: 'continue', interactionToken: 'original-token' },
    };
    const original = makeFlowState([event]);
    redactFlowState(original);
    const data = original.events[0].data as { interactionToken?: string };
    expect(data.interactionToken).toBe('original-token');
  });

  it('passes through events with no sensitive data unchanged', () => {
    const event: AuthEvent = {
      id: 'e9',
      timestamp: 4000,
      type: 'session:cookie',
      source: 'session',
      flowId: 'flow-1',
      causedBy: null,
      flags: baseFlags,
      data: { _tag: 'session', key: 'iPlanetDirectoryPro', before: 'old', after: 'new' },
    };
    const result = redactFlowState(makeFlowState([event]));
    expect(result.events[0]).toEqual(event);
  });
});
