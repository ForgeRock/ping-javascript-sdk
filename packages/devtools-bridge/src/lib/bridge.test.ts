import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachDevToolsBridge, nodeToSdkData } from './bridge.js';
import { DEVTOOLS_EVENT_NAME } from './emit.js';
import type { AuthEvent } from '@forgerock/devtools-types';

// ---------------------------------------------------------------------------
// nodeToSdkData unit tests (pure — no DOM, no events)
// ---------------------------------------------------------------------------

describe('nodeToSdkData', () => {
  it('maps a minimal node with only status', () => {
    const result = nodeToSdkData({ status: 'start' }, undefined);
    expect(result).toEqual({
      _tag: 'sdk',
      nodeStatus: 'start',
      previousStatus: undefined,
    });
  });

  it('uses "unknown" when status is absent', () => {
    const result = nodeToSdkData({}, undefined);
    expect(result.nodeStatus).toBe('unknown');
  });

  it('carries previousStatus through', () => {
    const result = nodeToSdkData({ status: 'continue' }, 'start');
    expect(result.previousStatus).toBe('start');
  });

  it('maps nested server fields', () => {
    const result = nodeToSdkData(
      {
        status: 'continue',
        server: {
          interactionId: 'iid-1',
          interactionToken: 'tok-1',
          id: 'node-id-1',
          eventName: 'LoginNode',
          session: 'sess-1',
        },
      },
      undefined,
    );
    expect(result.interactionId).toBe('iid-1');
    expect(result.interactionToken).toBe('tok-1');
    expect(result.nodeId).toBe('node-id-1');
    expect(result.eventName).toBe('LoginNode');
    expect(result.session).toBe('sess-1');
  });

  it('maps nested client fields', () => {
    const result = nodeToSdkData(
      {
        status: 'continue',
        client: {
          name: 'UsernameNode',
          description: 'Enter username',
          collectors: [{ type: 'TextCollector' }],
          authorization: { code: 'auth-code', state: 'state-1' },
        },
      },
      undefined,
    );
    expect(result.nodeName).toBe('UsernameNode');
    expect(result.nodeDescription).toBe('Enter username');
    expect(result.collectors).toEqual([{ type: 'TextCollector' }]);
    expect(result.authorization).toEqual({ code: 'auth-code', state: 'state-1' });
  });

  it('maps error and cache fields', () => {
    const result = nodeToSdkData(
      {
        status: 'error',
        httpStatus: 401,
        error: { code: 'UNAUTHORIZED', message: 'Bad creds', type: 'auth' },
        cache: { key: 'req-key-1' },
      },
      'continue',
    );
    expect(result.httpStatus).toBe(401);
    expect(result.error).toEqual({ code: 'UNAUTHORIZED', message: 'Bad creds', type: 'auth' });
    expect(result.requestId).toBe('req-key-1');
  });

  it('ignores unrecognised fields — does not bleed unknown keys', () => {
    const result = nodeToSdkData(
      { status: 'start', someUnknownField: 'x', server: { unknownServerKey: 99 } } as never,
      undefined,
    );
    expect(result).not.toHaveProperty('someUnknownField');
    expect(result).not.toHaveProperty('unknownServerKey');
  });

  it('coerces null error to undefined (success/continue nodes set error: null)', () => {
    const result = nodeToSdkData({ status: 'continue', error: null } as never, undefined);
    expect(result.error).toBeUndefined();
  });

  it('coerces null cache to undefined requestId', () => {
    const result = nodeToSdkData({ status: 'continue', cache: null } as never, undefined);
    expect(result.requestId).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Mock client factory
// ---------------------------------------------------------------------------

function makeClient(initialNode: Record<string, unknown>) {
  let listener: (() => void) | null = null;
  let node = initialNode;
  return {
    subscribe: vi.fn((cb: () => void) => {
      listener = cb;
      return () => {
        listener = null;
      };
    }),
    getNode: vi.fn(() => node),
    /** Test helper: update internal node and fire the subscribed listener. */
    trigger: (newNode: Record<string, unknown>) => {
      node = newNode;
      listener?.();
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function captureDevtoolsEvents(): { events: CustomEvent<AuthEvent>[]; stop: () => void } {
  const events: CustomEvent<AuthEvent>[] = [];
  const handler = (e: Event) => events.push(e as CustomEvent<AuthEvent>);
  window.addEventListener(DEVTOOLS_EVENT_NAME, handler);
  return { events, stop: () => window.removeEventListener(DEVTOOLS_EVENT_NAME, handler) };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('attachDevToolsBridge', () => {
  beforeEach(() => {
    // Simulate extension presence for all tests except the no-op test.
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;
  });

  afterEach(async () => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];
    // Flush any deferred setTimeout(0) callbacks so they don't bleed into later tests.
    await new Promise((r) => setTimeout(r, 10));
  });

  it('returns a BridgeHandle with a detach function', () => {
    const client = makeClient({ status: 'start' });
    const handle = attachDevToolsBridge(client);

    expect(handle).toHaveProperty('detach');
    expect(typeof handle.detach).toBe('function');

    handle.detach();
  });

  it('emits sdk:node-change when node status transitions (start → continue)', () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);

    // Trigger a status transition.
    client.trigger({ status: 'continue' });

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('sdk:node-change');
    expect(events[0].detail.data._tag).toBe('sdk');
  });

  it('emits events when node has error: null and cache: null (real DaVinci ContinueNode shape)', () => {
    // DaVinci reducers set error: null on ContinueNode and SuccessNode.
    // Schema.optional(SdkErrorSchema) rejects null — this test guards that regression.
    const continueNode = {
      status: 'continue',
      httpStatus: 200,
      error: null,
      cache: null,
      server: {
        interactionId: 'iid-abc',
        interactionToken: 'tok-xyz',
        id: 'node-1',
        eventName: 'UsernameNode',
      },
      client: {
        name: 'Sign In',
        description: 'Enter your username',
        collectors: [{ type: 'TextCollector', id: 'username-0' }],
      },
    };
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);
    client.trigger(continueNode);

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('sdk:node-change');
    const data = events[0].detail.data as {
      _tag: string;
      nodeStatus: string;
      interactionId?: string;
      nodeName?: string;
      error?: unknown;
    };
    expect(data._tag).toBe('sdk');
    expect(data.nodeStatus).toBe('continue');
    expect(data.interactionId).toBe('iid-abc');
    expect(data.nodeName).toBe('Sign In');
    expect(data.error).toBeUndefined();
  });

  it('does NOT emit when status has not changed', () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);

    // First trigger sets previousStatus = 'start'.
    client.trigger({ status: 'start' });
    // Second trigger with the same status — should be suppressed.
    client.trigger({ status: 'start' });

    handle.detach();
    stop();

    // The first trigger fires because previousStatus was undefined → 'start'.
    // The second trigger must be suppressed because status did not change.
    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('sdk:node-change');
    expect(events[0].detail.data._tag).toBe('sdk');
  });

  it('detach() unsubscribes the listener', () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);

    // Verify subscribe was wired up.
    expect(client.subscribe).toHaveBeenCalledTimes(1);

    handle.detach();

    // Fire after detach — should produce no new events.
    client.trigger({ status: 'continue' });

    stop();

    expect(events).toHaveLength(0);
  });

  it('emits sdk:config event on first transition when config is provided', () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client, {
      clientId: 'my-app',
      redirectUri: 'https://app.example.com/callback',
    });

    client.trigger({ status: 'continue' });

    handle.detach();
    stop();

    // First event should be sdk:config, second should be sdk:node-change
    expect(events).toHaveLength(2);
    expect(events[0].detail.type).toBe('sdk:config');
    expect(events[0].detail.data._tag).toBe('sdk-config');
    expect((events[0].detail.data as { _tag: string; config: unknown }).config).toEqual({
      clientId: 'my-app',
      redirectUri: 'https://app.example.com/callback',
    });
    expect(events[1].detail.type).toBe('sdk:node-change');
  });

  it('emits sdk:config only once across multiple transitions', () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client, { clientId: 'my-app' });

    client.trigger({ status: 'continue' });
    client.trigger({ status: 'success' });

    handle.detach();
    stop();

    const configEvents = events.filter((e) => e.detail.type === 'sdk:config');
    expect(configEvents).toHaveLength(1);
  });

  it('does not emit sdk:config when no config is provided', () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);

    client.trigger({ status: 'continue' });

    handle.detach();
    stop();

    const configEvents = events.filter((e) => e.detail.type === 'sdk:config');
    expect(configEvents).toHaveLength(0);
  });

  it('is a no-op when __PING_DEVTOOLS_EXTENSION__ is absent', () => {
    // Remove extension flag to exercise the guard branch.
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];

    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);

    // subscribe is called (the bridge still subscribes), but no events should be dispatched.
    expect(client.subscribe).toHaveBeenCalledTimes(1);

    client.trigger({ status: 'continue' });

    handle.detach(); // should not throw
    stop();

    expect(events).toHaveLength(0);
  });

  it('does not emit sdk:config when extension is absent even if config is provided', () => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];

    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client, { clientId: 'my-app' });
    client.trigger({ status: 'continue' });

    handle.detach();
    stop();

    // Re-add for cleanup
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;

    const configEvents = events.filter((e) => e.detail.type === 'sdk:config');
    expect(configEvents).toHaveLength(0);
  });
});

describe('attachDevToolsBridge session tracking', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;
    localStorage.clear();
    // Reset cookie (jsdom allows setting document.cookie)
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];
    localStorage.clear();
  });

  it('emits session:storage event when localStorage changes after a node transition', async () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);

    // Trigger a node transition, then mutate storage in the same tick
    client.trigger({ status: 'continue' });
    localStorage.setItem('ping:session', 'abc123');

    // Wait for setTimeout(0) deferred diff
    await new Promise((r) => setTimeout(r, 10));

    handle.detach();
    stop();

    const sessionEvents = events.filter((e) => e.detail.type === 'session:storage');
    expect(sessionEvents).toHaveLength(1);
    expect(sessionEvents[0].detail.data._tag).toBe('session');
    const data = sessionEvents[0].detail.data as {
      _tag: string;
      key: string;
      before?: string;
      after?: string;
    };
    expect(data.key).toBe('ping:session');
    expect(data.before).toBeUndefined();
    expect(data.after).toBe('abc123');
  });

  it('does not emit session events when nothing changes', async () => {
    const client = makeClient({ status: 'start' });
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachDevToolsBridge(client);
    client.trigger({ status: 'continue' });

    await new Promise((r) => setTimeout(r, 10));

    handle.detach();
    stop();

    const sessionEvents = events.filter(
      (e) => e.detail.type === 'session:storage' || e.detail.type === 'session:cookie',
    );
    expect(sessionEvents).toHaveLength(0);
  });
});
