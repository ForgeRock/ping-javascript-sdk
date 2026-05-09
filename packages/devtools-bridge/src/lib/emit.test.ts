import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AuthEvent } from '@forgerock/devtools-types';
import { DEVTOOLS_EVENT_NAME, emitAuthEvent, emitConfigEvent, configureDevtools } from './emit.js';

// Minimal valid AuthEvent fixture — _tag: 'sdk' satisfies the SdkDataSchema discriminant.
const makeEvent = (overrides: Partial<AuthEvent> = {}): AuthEvent => ({
  id: 'test-id-1',
  timestamp: 0,
  type: 'sdk:node-change',
  source: 'sdk',
  flowId: null,
  causedBy: null,
  data: {
    _tag: 'sdk',
    nodeStatus: 'continue',
  },
  flags: {
    isCors: false,
    isError: false,
    isAuthRelated: true,
  },
  ...overrides,
});

describe('emitAuthEvent', () => {
  beforeEach(() => {
    // Reset options between tests by calling configureDevtools with defaults
    configureDevtools({});
    delete window.__PING_DEVTOOLS_STATE__;
  });

  it('dispatches a CustomEvent with DEVTOOLS_EVENT_NAME and the event as detail', () => {
    const captured: CustomEvent<AuthEvent>[] = [];
    const handler = (e: Event) => {
      captured.push(e as CustomEvent<AuthEvent>);
    };

    window.addEventListener(DEVTOOLS_EVENT_NAME, handler);

    const event = makeEvent();
    emitAuthEvent(event);

    window.removeEventListener(DEVTOOLS_EVENT_NAME, handler);

    expect(captured).toHaveLength(1);
    expect(captured[0].type).toBe(DEVTOOLS_EVENT_NAME);
    expect(captured[0].detail).toBe(event);
  });

  it('does not throw when window is undefined', () => {
    // jsdom always defines window, so we temporarily remove it to exercise the guard branch.
    const saved = globalThis.window;
    // @ts-expect-error — intentionally deleting window to test the undefined guard
    delete globalThis.window;

    expect(() => emitAuthEvent(makeEvent())).not.toThrow();

    // Restore window so subsequent tests are unaffected.
    globalThis.window = saved;
  });

  it('accumulates events in window.__PING_DEVTOOLS_STATE__', () => {
    emitAuthEvent(makeEvent({ id: 'a' }));
    emitAuthEvent(makeEvent({ id: 'b' }));

    expect(window.__PING_DEVTOOLS_STATE__).toHaveLength(2);
    expect(window.__PING_DEVTOOLS_STATE__![0].id).toBe('a');
    expect(window.__PING_DEVTOOLS_STATE__![1].id).toBe('b');
  });

  it('initialises __PING_DEVTOOLS_STATE__ array on first call', () => {
    expect(window.__PING_DEVTOOLS_STATE__).toBeUndefined();
    emitAuthEvent(makeEvent());
    expect(Array.isArray(window.__PING_DEVTOOLS_STATE__)).toBe(true);
  });

  it('appends to existing __PING_DEVTOOLS_STATE__ array', () => {
    window.__PING_DEVTOOLS_STATE__ = [makeEvent({ id: 'existing' })];
    emitAuthEvent(makeEvent({ id: 'new' }));

    expect(window.__PING_DEVTOOLS_STATE__).toHaveLength(2);
    expect(window.__PING_DEVTOOLS_STATE__[1].id).toBe('new');
  });
});

describe('configureDevtools', () => {
  beforeEach(() => {
    configureDevtools({});
    delete window.__PING_DEVTOOLS_STATE__;
  });

  it('enables console logging when consoleLog is true', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    configureDevtools({ consoleLog: true });
    const event = makeEvent();
    emitAuthEvent(event);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('[ping-devtools]', event.type, event);

    spy.mockRestore();
  });

  it('does not console.log when consoleLog is false', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    configureDevtools({ consoleLog: false });
    emitAuthEvent(makeEvent());

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });

  it('does not console.log by default (no options)', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    configureDevtools({});
    emitAuthEvent(makeEvent());

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});

describe('emitConfigEvent', () => {
  beforeEach(() => {
    configureDevtools({});
    delete window.__PING_DEVTOOLS_STATE__;
  });

  it('emits an sdk:config event with the provided config object', () => {
    const captured: CustomEvent<AuthEvent>[] = [];
    const handler = (e: Event) => captured.push(e as CustomEvent<AuthEvent>);
    window.addEventListener(DEVTOOLS_EVENT_NAME, handler);

    const config = { serverUrl: 'https://auth.example.com', clientId: 'my-app' };
    emitConfigEvent(config);

    window.removeEventListener(DEVTOOLS_EVENT_NAME, handler);

    expect(captured).toHaveLength(1);
    const event = captured[0].detail;
    expect(event.type).toBe('sdk:config');
    expect(event.source).toBe('sdk');
    expect(event.data._tag).toBe('sdk-config');
    if (event.data._tag === 'sdk-config') {
      expect(event.data.config).toEqual(config);
    }
  });

  it('generates a unique id and timestamp', () => {
    const captured: CustomEvent<AuthEvent>[] = [];
    const handler = (e: Event) => captured.push(e as CustomEvent<AuthEvent>);
    window.addEventListener(DEVTOOLS_EVENT_NAME, handler);

    emitConfigEvent({});
    emitConfigEvent({});

    window.removeEventListener(DEVTOOLS_EVENT_NAME, handler);

    expect(captured[0].detail.id).not.toBe(captured[1].detail.id);
    expect(typeof captured[0].detail.timestamp).toBe('number');
  });

  it('sets flowId and causedBy to null', () => {
    const captured: CustomEvent<AuthEvent>[] = [];
    const handler = (e: Event) => captured.push(e as CustomEvent<AuthEvent>);
    window.addEventListener(DEVTOOLS_EVENT_NAME, handler);

    emitConfigEvent({ key: 'value' });

    window.removeEventListener(DEVTOOLS_EVENT_NAME, handler);

    expect(captured[0].detail.flowId).toBeNull();
    expect(captured[0].detail.causedBy).toBeNull();
  });

  it('sets flags to non-cors, non-error, auth-related', () => {
    const captured: CustomEvent<AuthEvent>[] = [];
    const handler = (e: Event) => captured.push(e as CustomEvent<AuthEvent>);
    window.addEventListener(DEVTOOLS_EVENT_NAME, handler);

    emitConfigEvent({});

    window.removeEventListener(DEVTOOLS_EVENT_NAME, handler);

    expect(captured[0].detail.flags).toEqual({
      isCors: false,
      isError: false,
      isAuthRelated: true,
    });
  });
});
