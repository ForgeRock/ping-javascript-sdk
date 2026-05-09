import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { FlowStateSchema, FlowSummarySchema } from './flow-state.schema.js';

const validSummary = {
  nodeCount: 3,
  errorCount: 1,
  corsFlags: [],
  duration: 1500,
  sdkConnected: true,
};

const validNetworkEvent = {
  id: 'evt-001',
  timestamp: 1700000000000,
  type: 'network:response',
  source: 'network',
  flowId: 'flow-abc',
  causedBy: null,
  data: {
    _tag: 'network',
    url: 'https://auth.example.com/token',
    method: 'POST',
    status: 200,
    requestHeaders: { 'content-type': 'application/json' },
    responseHeaders: { 'x-request-id': 'abc123' },
    duration: 123,
  },
  flags: { isCors: false, isError: false, isAuthRelated: true },
};

describe('FlowSummarySchema', () => {
  it('decodes a valid summary', () => {
    const result = Schema.decodeUnknownSync(FlowSummarySchema)(validSummary);
    expect(result.nodeCount).toBe(3);
    expect(result.errorCount).toBe(1);
    expect(result.sdkConnected).toBe(true);
  });

  it('decodes a summary with corsFlags', () => {
    const input = {
      ...validSummary,
      corsFlags: [
        {
          url: 'https://auth.example.com/token',
          reason: 'status-zero',
          method: 'POST',
        },
      ],
    };
    const result = Schema.decodeUnknownSync(FlowSummarySchema)(input);
    expect(result.corsFlags).toHaveLength(1);
    expect(result.corsFlags[0].reason).toBe('status-zero');
  });

  it('rejects missing nodeCount', () => {
    const { nodeCount, ...rest } = validSummary;
    expect(() => Schema.decodeUnknownSync(FlowSummarySchema)(rest)).toThrow();
  });

  it('rejects invalid corsFlag reason', () => {
    const input = {
      ...validSummary,
      corsFlags: [{ url: 'https://x.com', reason: 'bad-reason', method: 'GET' }],
    };
    expect(() => Schema.decodeUnknownSync(FlowSummarySchema)(input)).toThrow();
  });
});

describe('FlowStateSchema', () => {
  const validFlowState = {
    flowId: 'flow-abc',
    capturedAt: '2026-05-08T14:30:00.000Z',
    events: [validNetworkEvent],
    summary: validSummary,
  };

  it('decodes a valid flow state', () => {
    const result = Schema.decodeUnknownSync(FlowStateSchema)(validFlowState);
    expect(result.flowId).toBe('flow-abc');
    expect(result.events).toHaveLength(1);
    expect(result.capturedAt).toBe('2026-05-08T14:30:00.000Z');
  });

  it('accepts null flowId', () => {
    const input = { ...validFlowState, flowId: null };
    const result = Schema.decodeUnknownSync(FlowStateSchema)(input);
    expect(result.flowId).toBeNull();
  });

  it('defaults lastSdkEventId to null when omitted', () => {
    const result = Schema.decodeUnknownSync(FlowStateSchema)(validFlowState);
    expect(result.lastSdkEventId).toBeNull();
  });

  it('accepts explicit lastSdkEventId', () => {
    const input = { ...validFlowState, lastSdkEventId: 'sdk-42' };
    const result = Schema.decodeUnknownSync(FlowStateSchema)(input);
    expect(result.lastSdkEventId).toBe('sdk-42');
  });

  it('accepts null lastSdkEventId', () => {
    const input = { ...validFlowState, lastSdkEventId: null };
    const result = Schema.decodeUnknownSync(FlowStateSchema)(input);
    expect(result.lastSdkEventId).toBeNull();
  });

  it('accepts empty events array', () => {
    const input = { ...validFlowState, events: [] };
    const result = Schema.decodeUnknownSync(FlowStateSchema)(input);
    expect(result.events).toHaveLength(0);
  });

  it('rejects missing summary', () => {
    const { summary, ...rest } = validFlowState;
    expect(() => Schema.decodeUnknownSync(FlowStateSchema)(rest)).toThrow();
  });

  it('rejects invalid event in events array', () => {
    const input = { ...validFlowState, events: [{ id: 'bad' }] };
    expect(() => Schema.decodeUnknownSync(FlowStateSchema)(input)).toThrow();
  });
});
