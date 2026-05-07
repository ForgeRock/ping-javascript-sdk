import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { AuthEventSchema } from './auth-event.schema.js';

const baseEvent = {
  id: 'evt-001',
  timestamp: 1700000000000,
  source: 'network' as const,
  flowId: 'flow-abc',
  causedBy: null,
  flags: {
    isCors: false,
    isError: false,
    isAuthRelated: true,
  },
};

describe('AuthEventSchema', () => {
  it('decodes a valid network event', () => {
    const input = {
      ...baseEvent,
      type: 'network:response',
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'POST',
        status: 200,
        requestHeaders: { 'content-type': 'application/json' },
        responseHeaders: { 'x-request-id': 'abc123' },
        duration: 123,
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);

    expect(result.id).toBe('evt-001');
    expect(result.type).toBe('network:response');
    expect(result.data._tag).toBe('network');
  });

  it('rejects an event with an unknown type field', () => {
    const input = {
      ...baseEvent,
      type: 'unknown:event-type',
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'GET',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 50,
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow(
      /unknown:event-type|type/i,
    );
  });

  it('rejects an event with missing required id field', () => {
    const input = {
      timestamp: 1700000000000,
      type: 'network:request',
      source: 'network',
      flowId: null,
      flags: { isCors: false, isError: false, isAuthRelated: false },
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/authorize',
        method: 'GET',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 10,
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow(/id/i);
  });

  it('accepts null flowId', () => {
    const input = {
      ...baseEvent,
      type: 'network:request',
      flowId: null,
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/authorize',
        method: 'GET',
        status: 302,
        requestHeaders: {},
        responseHeaders: {},
        duration: 10,
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);

    expect(result.flowId).toBeNull();
  });

  it('decodes a valid sdk event', () => {
    const input = {
      id: 'evt-002',
      timestamp: 1700000001000,
      type: 'sdk:node-change',
      source: 'sdk',
      flowId: 'flow-xyz',
      causedBy: null,
      flags: { isCors: false, isError: false, isAuthRelated: true },
      data: {
        _tag: 'sdk',
        nodeStatus: 'next',
        interactionId: 'interaction-123',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);

    expect(result.id).toBe('evt-002');
    expect(result.type).toBe('sdk:node-change');
    expect(result.data._tag).toBe('sdk');
  });
});
