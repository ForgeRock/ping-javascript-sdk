import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { FlowExportSchema } from './flow-export.schema.js';

const validExport = {
  version: 1,
  exportedAt: '2026-05-08T14:32:00.000Z',
  redacted: true,
  flow: {
    flowId: 'flow-abc',
    capturedAt: '2026-05-08T14:30:00.000Z',
    events: [
      {
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
      },
    ],
    summary: {
      nodeCount: 0,
      errorCount: 0,
      corsFlags: [],
      duration: 0,
      sdkConnected: false,
    },
  },
};

describe('FlowExportSchema', () => {
  it('decodes a valid export envelope', () => {
    const result = Schema.decodeUnknownSync(FlowExportSchema)(validExport);
    expect(result.version).toBe(1);
    expect(result.redacted).toBe(true);
    expect(result.flow.events).toHaveLength(1);
    expect(result.flow.flowId).toBe('flow-abc');
  });

  it('rejects missing version field', () => {
    const { version, ...noVersion } = validExport;
    expect(() => Schema.decodeUnknownSync(FlowExportSchema)(noVersion)).toThrow();
  });

  it('rejects wrong version number', () => {
    const input = { ...validExport, version: 2 };
    expect(() => Schema.decodeUnknownSync(FlowExportSchema)(input)).toThrow();
  });

  it('rejects invalid event inside flow.events', () => {
    const input = {
      ...validExport,
      flow: {
        ...validExport.flow,
        events: [{ id: 'bad', timestamp: 0 }],
      },
    };
    expect(() => Schema.decodeUnknownSync(FlowExportSchema)(input)).toThrow();
  });

  it('accepts flow with lastSdkEventId (optional field defaults to null)', () => {
    const input = {
      ...validExport,
      flow: { ...validExport.flow, lastSdkEventId: 'sdk-99' },
    };
    const result = Schema.decodeUnknownSync(FlowExportSchema)(input);
    expect(result.flow.lastSdkEventId).toBe('sdk-99');
  });
});
