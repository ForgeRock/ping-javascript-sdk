import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachOidcBridge } from './oidc-bridge.js';
import { DEVTOOLS_EVENT_NAME } from './emit.js';
import type { AuthEvent } from '@forgerock/devtools-types';

// ---------------------------------------------------------------------------
// Mock client factory
// ---------------------------------------------------------------------------

type OidcState = {
  oidc: {
    mutations: Record<
      string,
      { status: string; endpointName?: string; data?: unknown; error?: unknown }
    >;
  };
};

function makeClient(initialState: OidcState) {
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
    /** Test helper: replace state and fire the subscribed listener. */
    trigger: (newState: OidcState) => {
      state = newState;
      listener?.();
    },
  };
}

function emptyState(): OidcState {
  return { oidc: { mutations: {} } };
}

function fulfilledMutation(endpointName: string): OidcState['oidc']['mutations'][string] {
  return { status: 'fulfilled', endpointName };
}

function rejectedMutation(
  endpointName: string,
  error: unknown,
): OidcState['oidc']['mutations'][string] {
  return { status: 'rejected', endpointName, error };
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

describe('attachOidcBridge', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];
  });

  it('returns a handle with a detach function', () => {
    const client = makeClient(emptyState());
    const handle = attachOidcBridge(client);
    expect(handle).toHaveProperty('detach');
    expect(typeof handle.detach).toBe('function');
    handle.detach();
  });

  it('emits sdk:oidc-state for a fulfilled authorizeFetch mutation', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('authorizeFetch') } } });

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('sdk:oidc-state');
    const data = events[0].detail.data as { _tag: string; phase: string; status: string };
    expect(data._tag).toBe('oidc');
    expect(data.phase).toBe('authorize');
    expect(data.status).toBe('success');
  });

  it('maps authorizeIframe → authorize phase', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('authorizeIframe') } } });

    handle.detach();
    stop();

    const data = events[0].detail.data as { phase: string };
    expect(data.phase).toBe('authorize');
  });

  it.each([
    ['exchange', 'exchange'],
    ['revoke', 'revoke'],
    ['userInfo', 'userinfo'],
    ['endSession', 'logout'],
  ])('maps %s → %s phase', (endpointName, expectedPhase) => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation(endpointName) } } });

    handle.detach();
    stop();

    const data = events[0].detail.data as { phase: string };
    expect(data.phase).toBe(expectedPhase);
  });

  it('emits status:error and extracts errorCode/errorMessage for rejected mutation', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': rejectedMutation('exchange', {
            status: 400,
            data: { error: 'invalid_grant', error_description: 'Token expired' },
          }),
        },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
    const data = events[0].detail.data as {
      _tag: string;
      phase: string;
      status: string;
      errorCode?: string;
      errorMessage?: string;
    };
    expect(data.status).toBe('error');
    expect(data.errorCode).toBe('invalid_grant');
    expect(data.errorMessage).toBe('Token expired');
    expect(events[0].detail.flags.isError).toBe(true);
  });

  it('falls back to HTTP status code when data.error is absent', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: { mutations: { 'req-1': rejectedMutation('revoke', { status: 401 }) } },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorCode?: string };
    expect(data.errorCode).toBe('401');
  });

  it('does NOT emit for pending mutations (status = pending)', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: { mutations: { 'req-1': { status: 'pending', endpointName: 'exchange' } } },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(0);
  });

  it('does NOT emit for an unknown endpointName (no phase mapping)', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: { mutations: { 'req-1': fulfilledMutation('unknownEndpoint') } },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(0);
  });

  it('does NOT re-emit for the same requestId on a second trigger', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);

    const state: OidcState = {
      oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } },
    };
    client.trigger(state);
    // Same requestId still present — should not emit again.
    client.trigger(state);

    handle.detach();
    stop();

    expect(events).toHaveLength(1);
  });

  it('emits sdk:config on the first mutation when config is provided', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client, { clientId: 'my-app' });
    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } } });

    handle.detach();
    stop();

    expect(events).toHaveLength(2);
    expect(events[0].detail.type).toBe('sdk:config');
    expect(events[1].detail.type).toBe('sdk:oidc-state');
  });

  it('emits sdk:config only once across multiple mutations', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client, { clientId: 'my-app' });

    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } } });
    client.trigger({
      oidc: {
        mutations: { 'req-1': fulfilledMutation('exchange'), 'req-2': fulfilledMutation('revoke') },
      },
    });

    handle.detach();
    stop();

    const configEvents = events.filter((e) => e.detail.type === 'sdk:config');
    expect(configEvents).toHaveLength(1);
  });

  it('includes clientId in the emitted oidc data', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client, { clientId: 'ping-app' });
    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } } });

    handle.detach();
    stop();

    const oidcEvent = events.find((e) => e.detail.type === 'sdk:oidc-state');
    const data = oidcEvent?.detail.data as { clientId?: string };
    expect(data.clientId).toBe('ping-app');
  });

  it('does NOT emit when __PING_DEVTOOLS_EXTENSION__ is absent', () => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];

    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } } });

    handle.detach();
    stop();

    expect(events).toHaveLength(0);
  });

  it('detach() stops the listener', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    handle.detach();

    client.trigger({ oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } } });

    stop();

    expect(events).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Edge-case tests for pure function paths (extractOidcError, mutationToOidcData)
// ---------------------------------------------------------------------------

describe('extractOidcError (via integration)', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];
  });

  it('extracts error_description from error.data', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': rejectedMutation('exchange', {
            data: { error: 'invalid_grant', error_description: 'Code expired' },
          }),
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorCode?: string; errorMessage?: string };
    expect(data.errorCode).toBe('invalid_grant');
    expect(data.errorMessage).toBe('Code expired');
  });

  it('falls back to data.message when error_description is absent', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': rejectedMutation('exchange', {
            data: { message: 'Server error' },
          }),
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorCode?: string; errorMessage?: string };
    expect(data.errorCode).toBeUndefined();
    expect(data.errorMessage).toBe('Server error');
  });

  it('falls back to top-level message when no data object', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': rejectedMutation('exchange', { message: 'Top level error' }),
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorMessage?: string };
    expect(data.errorMessage).toBe('Top level error');
  });

  it('extracts string error as errorMessage', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': rejectedMutation('exchange', 'plain string error'),
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorMessage?: string; errorCode?: string };
    expect(data.errorMessage).toBe('plain string error');
    expect(data.errorCode).toBeUndefined();
  });

  it('returns empty error fields for null error', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': rejectedMutation('exchange', null),
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorCode?: string; errorMessage?: string };
    expect(data.errorCode).toBeUndefined();
    expect(data.errorMessage).toBeUndefined();
  });

  it('returns empty error fields for undefined error', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': { status: 'rejected', endpointName: 'exchange' },
        },
      },
    });

    handle.detach();
    stop();

    const data = events[0].detail.data as { errorCode?: string; errorMessage?: string };
    expect(data.errorCode).toBeUndefined();
    expect(data.errorMessage).toBeUndefined();
  });
});

describe('mutationToOidcData edge cases (via integration)', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'] = true;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['__PING_DEVTOOLS_EXTENSION__'];
  });

  it('does not emit for mutation with undefined endpointName', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);
    client.trigger({
      oidc: {
        mutations: {
          'req-1': { status: 'fulfilled' },
        },
      },
    });

    handle.detach();
    stop();

    expect(events).toHaveLength(0);
  });

  it('trims stale requestIds from emitted set', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client);

    // First trigger: add req-1
    client.trigger({
      oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } },
    });

    // Second trigger: req-1 removed, req-2 added
    client.trigger({
      oidc: { mutations: { 'req-2': fulfilledMutation('revoke') } },
    });

    handle.detach();
    stop();

    const oidcEvents = events.filter((e) => e.detail.type === 'sdk:oidc-state');
    expect(oidcEvents).toHaveLength(2);
    expect((oidcEvents[0].detail.data as { phase: string }).phase).toBe('exchange');
    expect((oidcEvents[1].detail.data as { phase: string }).phase).toBe('revoke');
  });

  it('passes undefined clientId when config has no clientId', () => {
    const client = makeClient(emptyState());
    const { events, stop } = captureDevtoolsEvents();

    const handle = attachOidcBridge(client, {});
    client.trigger({
      oidc: { mutations: { 'req-1': fulfilledMutation('exchange') } },
    });

    handle.detach();
    stop();

    const oidcEvent = events.find((e) => e.detail.type === 'sdk:oidc-state');
    const data = oidcEvent?.detail.data as { clientId?: string };
    expect(data.clientId).toBeUndefined();
  });
});
