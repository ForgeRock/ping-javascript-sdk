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

  it('decodes sdk:node-change with all optional sdk fields', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:node-change',
      source: 'sdk',
      data: {
        _tag: 'sdk',
        nodeStatus: 'continue',
        previousStatus: 'start',
        interactionId: 'int-1',
        interactionToken: 'tok-1',
        nodeId: 'node-1',
        requestId: 'req-1',
        nodeName: 'Username',
        nodeDescription: 'Enter your name',
        eventName: 'click',
        httpStatus: 200,
        collectors: [{ type: 'TextCollector' }],
        error: { code: 'E001', message: 'Failed', type: 'auth' },
        authorization: { code: 'auth-code', state: 'xyz' },
        session: 'sess-abc',
        responseBody: { key: 'value' },
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('sdk');
    if (result.data._tag === 'sdk') {
      expect(result.data.nodeName).toBe('Username');
      expect(result.data.error?.code).toBe('E001');
      expect(result.data.authorization?.code).toBe('auth-code');
      expect(result.data.collectors).toHaveLength(1);
    }
  });

  it('decodes sdk:config event', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:config',
      source: 'sdk',
      data: {
        _tag: 'sdk-config',
        config: { serverUrl: 'https://auth.example.com', clientId: 'my-app' },
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('sdk-config');
  });

  it('decodes sdk:journey-step event', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:journey-step',
      source: 'sdk',
      data: {
        _tag: 'journey',
        stepType: 'Step',
        authId: 'auth-123',
        stage: 'UsernamePassword',
        header: 'Sign In',
        description: 'Enter credentials',
        callbacks: [{ type: 'NameCallback' }],
        realm: '/alpha',
        tokenId: 'tok-1',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('journey');
    if (result.data._tag === 'journey') {
      expect(result.data.stepType).toBe('Step');
      expect(result.data.authId).toBe('auth-123');
      expect(result.data.callbacks).toHaveLength(1);
    }
  });

  it('decodes sdk:journey-step LoginFailure with error fields', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:journey-step',
      source: 'sdk',
      data: {
        _tag: 'journey',
        stepType: 'LoginFailure',
        errorCode: 401,
        errorMessage: 'Authentication Failed',
        errorReason: 'InvalidCredentials',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    if (result.data._tag === 'journey') {
      expect(result.data.stepType).toBe('LoginFailure');
      expect(result.data.errorCode).toBe(401);
      expect(result.data.errorMessage).toBe('Authentication Failed');
    }
  });

  it('rejects journey event with invalid stepType', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:journey-step',
      source: 'sdk',
      data: {
        _tag: 'journey',
        stepType: 'InvalidStep',
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow();
  });

  it('decodes sdk:oidc-state event', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:oidc-state',
      source: 'sdk',
      data: {
        _tag: 'oidc',
        phase: 'authorize',
        status: 'success',
        clientId: 'my-app',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('oidc');
    if (result.data._tag === 'oidc') {
      expect(result.data.phase).toBe('authorize');
      expect(result.data.status).toBe('success');
      expect(result.data.clientId).toBe('my-app');
    }
  });

  it('decodes oidc error event with errorCode and errorMessage', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:oidc-state',
      source: 'sdk',
      data: {
        _tag: 'oidc',
        phase: 'exchange',
        status: 'error',
        errorCode: 'invalid_grant',
        errorMessage: 'Token expired',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    if (result.data._tag === 'oidc') {
      expect(result.data.errorCode).toBe('invalid_grant');
      expect(result.data.errorMessage).toBe('Token expired');
    }
  });

  it('rejects oidc event with invalid phase', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:oidc-state',
      source: 'sdk',
      data: {
        _tag: 'oidc',
        phase: 'unknown-phase',
        status: 'success',
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow();
  });

  it('rejects oidc event with invalid status', () => {
    const input = {
      ...baseEvent,
      type: 'sdk:oidc-state',
      source: 'sdk',
      data: {
        _tag: 'oidc',
        phase: 'authorize',
        status: 'pending',
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow();
  });

  it('decodes session:storage event', () => {
    const input = {
      ...baseEvent,
      type: 'session:storage',
      source: 'session',
      data: {
        _tag: 'session',
        key: 'am-auth-session',
        before: 'old-value',
        after: 'new-value',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('session');
    if (result.data._tag === 'session') {
      expect(result.data.key).toBe('am-auth-session');
      expect(result.data.before).toBe('old-value');
      expect(result.data.after).toBe('new-value');
    }
  });

  it('decodes session event with optional before/after', () => {
    const input = {
      ...baseEvent,
      type: 'session:storage',
      source: 'session',
      data: {
        _tag: 'session',
        key: 'token',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    if (result.data._tag === 'session') {
      expect(result.data.before).toBeUndefined();
      expect(result.data.after).toBeUndefined();
    }
  });

  it('decodes dom:form-submit event', () => {
    const input = {
      ...baseEvent,
      type: 'dom:form-submit',
      source: 'dom',
      data: {
        _tag: 'dom',
        element: 'form#login',
        url: 'https://app.example.com/login',
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('dom');
    if (result.data._tag === 'dom') {
      expect(result.data.element).toBe('form#login');
      expect(result.data.url).toBe('https://app.example.com/login');
    }
  });

  it('decodes dom event with all optional fields omitted', () => {
    const input = {
      ...baseEvent,
      type: 'dom:redirect',
      source: 'dom',
      data: { _tag: 'dom' },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.data._tag).toBe('dom');
  });

  it('decodes network event with corsFlag', () => {
    const input = {
      ...baseEvent,
      type: 'network:cors-flag',
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'POST',
        status: 0,
        requestHeaders: { origin: 'https://app.example.com' },
        responseHeaders: {},
        duration: 0,
        corsFlag: {
          url: 'https://auth.example.com/token',
          reason: 'status-zero',
          method: 'POST',
        },
      },
      flags: { isCors: true, isError: true, isAuthRelated: true },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    if (result.data._tag === 'network') {
      expect(result.data.corsFlag?.reason).toBe('status-zero');
    }
  });

  it('decodes network event with request and response bodies', () => {
    const input = {
      ...baseEvent,
      type: 'network:response',
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'POST',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 100,
        requestBody: { grant_type: 'authorization_code' },
        responseBody: { access_token: 'abc', token_type: 'Bearer' },
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    if (result.data._tag === 'network') {
      expect(result.data.requestBody).toEqual({ grant_type: 'authorization_code' });
      expect(result.data.responseBody).toEqual({ access_token: 'abc', token_type: 'Bearer' });
    }
  });

  it('rejects event with invalid source', () => {
    const input = {
      ...baseEvent,
      source: 'invalid-source',
      type: 'network:response',
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'GET',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 10,
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow();
  });

  it('validates flags field structure', () => {
    const input = {
      ...baseEvent,
      type: 'network:response',
      flags: { isCors: 'not-a-boolean', isError: false, isAuthRelated: true },
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'GET',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 10,
      },
    };

    expect(() => Schema.decodeUnknownSync(AuthEventSchema)(input)).toThrow();
  });

  it('accepts causedBy as a string', () => {
    const input = {
      ...baseEvent,
      type: 'network:response',
      causedBy: 'sdk-evt-123',
      data: {
        _tag: 'network',
        url: 'https://auth.example.com/token',
        method: 'GET',
        status: 200,
        requestHeaders: {},
        responseHeaders: {},
        duration: 10,
      },
    };

    const result = Schema.decodeUnknownSync(AuthEventSchema)(input);
    expect(result.causedBy).toBe('sdk-evt-123');
  });
});
