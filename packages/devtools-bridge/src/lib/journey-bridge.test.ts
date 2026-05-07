import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachJourneyBridge } from './journey-bridge.js';
import { DEVTOOLS_EVENT_NAME } from './emit.js';
import type { AuthEvent } from '@forgerock/devtools-types';

// ---------------------------------------------------------------------------
// Mock client factory
// ---------------------------------------------------------------------------

type JourneyState = {
  journeyReducer: {
    mutations: Record<
      string,
      { status: string; endpointName?: string; data?: unknown; error?: unknown }
    >;
  };
};

function makeClient(initialState: JourneyState) {
  let listener: (() => void) | null = null;
  let state = initialState;
  return {
    subscribe: vi.fn((cb: () => void) => {
      listener = cb;
      return () => {
        listener = null;
      };
    }),
    getState: vi.fn(() => state),
    trigger: (newState: JourneyState) => {
      state = newState;
      listener?.();
    },
  };
}

function emptyState(): JourneyState {
  return { journeyReducer: { mutations: {} } };
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

describe('attachJourneyBridge', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];
  });

  it('returns a handle with a detach function', () => {
    const client = makeClient(emptyState());
    const handle = attachJourneyBridge(client);
    expect(handle).toHaveProperty('detach');
    expect(typeof handle.detach).toBe('function');
    handle.detach();
  });

  it('emits sdk:journey-step with stepType=Step for a fulfilled step response (has authId)', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': {
            status: 'fulfilled',
            endpointName: 'next',
            data: {
              authId: 'abc123',
              stage: 'UsernamePassword',
              header: 'Sign In',
              description: 'Enter your credentials',
              callbacks: [{ type: 'NameCallback' }, { type: 'PasswordCallback' }],
            },
          },
        },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('sdk:journey-step');
    const data = events[0].detail.data as {
      _tag: string;
      stepType: string;
      callbacks: unknown[];
      authId?: string;
      stage?: string;
      header?: string;
    };
    expect(data._tag).toBe('journey');
    expect(data.stepType).toBe('Step');
    expect(data.authId).toBe('abc123');
    expect(data.stage).toBe('UsernamePassword');
    expect(data.header).toBe('Sign In');
    expect(data.callbacks).toEqual([{ type: 'NameCallback' }, { type: 'PasswordCallback' }]);
    expect(events[0].detail.flags.isError).toBe(false);
  });

  it('emits stepType=LoginSuccess when successUrl is present', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': {
            status: 'fulfilled',
            endpointName: 'next',
            data: { successUrl: 'https://app.example.com/dashboard' },
          },
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { stepType: string };
    expect(data.stepType).toBe('LoginSuccess');
    expect(events[0].detail.flags.isError).toBe(false);
  });

  it('emits stepType=LoginFailure with error fields when no authId or successUrl', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': {
            status: 'fulfilled',
            endpointName: 'next',
            data: {
              code: 110,
              message: 'Authentication Failed',
              reason: 'LoginFailure',
            },
          },
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as {
      stepType: string;
      errorCode?: number;
      errorMessage?: string;
      errorReason?: string;
    };
    expect(data.stepType).toBe('LoginFailure');
    expect(data.errorCode).toBe(110);
    expect(data.errorMessage).toBe('Authentication Failed');
    expect(data.errorReason).toBe('LoginFailure');
    expect(events[0].detail.flags.isError).toBe(true);
  });

  it('emits stepType=LoginFailure for a rejected mutation with error message', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': {
            status: 'rejected',
            endpointName: 'next',
            error: { message: 'Network error' },
          },
        },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('sdk:journey-step');
    const data = events[0].detail.data as unknown as {
      stepType: string;
      errorMessage?: string;
    };
    expect(data.stepType).toBe('LoginFailure');
    expect(data.errorMessage).toBe('Network error');
    expect(events[0].detail.flags.isError).toBe(true);
  });

  it('extracts errorMessage from nested error.data.message for rejected mutation', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': {
            status: 'rejected',
            endpointName: 'next',
            error: { data: { message: 'Session expired' } },
          },
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorMessage?: string };
    expect(data.errorMessage).toBe('Session expired');
  });

  it('falls back to "Unknown error" when rejected mutation has no extractable message', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': { status: 'rejected', endpointName: 'next', error: { status: 500 } },
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorMessage?: string };
    expect(data.errorMessage).toBe('Unknown error');
  });

  it('does NOT emit for pending mutations', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: { 'req-1': { status: 'pending', endpointName: 'next' } },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(0);
  });

  it('does NOT re-emit for the same requestId on a second trigger', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    const state: JourneyState = {
      journeyReducer: {
        mutations: {
          'req-1': { status: 'fulfilled', data: { authId: 'abc' } },
        },
      },
    };
    client.trigger(state);
    client.trigger(state);

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
  });

  it('emits sdk:config on first mutation when config is provided', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client, { realm: '/alpha' });
    client.trigger({
      journeyReducer: {
        mutations: { 'req-1': { status: 'fulfilled', data: { authId: 'abc' } } },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(2);
    expect(events[0].detail.type).toBe('sdk:config');
    expect(events[1].detail.type).toBe('sdk:journey-step');
  });

  it('emits sdk:config only once across multiple mutations', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client, { realm: '/alpha' });

    client.trigger({
      journeyReducer: {
        mutations: { 'req-1': { status: 'fulfilled', data: { authId: 'abc' } } },
      },
    });
    client.trigger({
      journeyReducer: {
        mutations: {
          'req-1': { status: 'fulfilled', data: { authId: 'abc' } },
          'req-2': { status: 'fulfilled', data: { successUrl: '/home' } },
        },
      },
    });

    handle.detach();
    stop();

    const configEvents = events.filter((e) => e.detail.type === 'sdk:config');
    expect(configEvents).toHaveLength(1);
  });

  it('does NOT emit when __PING_DEVTOOLS_EXTENSION__ is absent', () => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];

    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    client.trigger({
      journeyReducer: {
        mutations: { 'req-1': { status: 'fulfilled', data: { authId: 'abc' } } },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(0);
  });

  it('detach() stops the listener', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachJourneyBridge(client);
    handle.detach();

    client.trigger({
      journeyReducer: {
        mutations: { 'req-1': { status: 'fulfilled', data: { authId: 'abc' } } },
      },
    });

    stop();

    expect(events).toHaveLength(0);
  });
});
