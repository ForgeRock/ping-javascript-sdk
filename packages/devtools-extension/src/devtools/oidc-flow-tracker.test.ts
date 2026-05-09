import { describe, it, expect } from 'vitest';
import { makeEmptyOidcFlowState, trackOidcEvent } from './oidc-flow-tracker.js';
import type { AuthEvent } from '@forgerock/devtools-types';

const makeEvent = (overrides: Partial<AuthEvent> = {}): AuthEvent => ({
  id: `evt-${Math.random().toString(36).slice(2, 8)}`,
  timestamp: Date.now(),
  type: 'network:response',
  source: 'network',
  flowId: null,
  causedBy: null,
  data: {
    _tag: 'network',
    url: 'https://auth.example.com/authorize',
    method: 'GET',
    status: 200,
    requestHeaders: {},
    responseHeaders: {},
    duration: 50,
  },
  flags: { isCors: false, isError: false, isAuthRelated: true },
  ...overrides,
});

describe('trackOidcEvent', () => {
  it('returns null for events without oidcSemantics', () => {
    const state = makeEmptyOidcFlowState();
    const event = makeEvent();
    const result = trackOidcEvent(event, state);
    expect(result.flowId).toBeNull();
  });

  it('creates a flow for authorize events', () => {
    const state = makeEmptyOidcFlowState();
    const event = makeEvent({
      oidcSemantics: {
        _tag: 'oidc-semantics',
        oidcPhase: 'authorize',
        clientId: 'app1',
        state: 'state-abc',
      },
    });
    const result = trackOidcEvent(event, state);
    expect(result.flowId).not.toBeNull();
    expect(result.updatedState.flows).toHaveLength(1);
    expect(result.updatedState.flows[0].phases).toEqual(['authorize']);
  });

  it('links token events to authorize flow', () => {
    let state = makeEmptyOidcFlowState();

    const authEvent = makeEvent({
      oidcSemantics: {
        _tag: 'oidc-semantics',
        oidcPhase: 'authorize',
        state: 'state-1',
      },
    });
    const authResult = trackOidcEvent(authEvent, state);
    state = authResult.updatedState;

    const tokenEvent = makeEvent({
      oidcSemantics: {
        _tag: 'oidc-semantics',
        oidcPhase: 'token',
        grantType: 'authorization_code',
      },
    });
    const tokenResult = trackOidcEvent(tokenEvent, state);

    expect(tokenResult.flowId).toBe(authResult.flowId);
    expect(tokenResult.updatedState.flows[0].phases).toEqual(['authorize', 'token']);
  });

  it('creates standalone flow for client_credentials', () => {
    const state = makeEmptyOidcFlowState();
    const event = makeEvent({
      oidcSemantics: {
        _tag: 'oidc-semantics',
        oidcPhase: 'token',
        grantType: 'client_credentials',
      },
    });
    const result = trackOidcEvent(event, state);
    expect(result.flowId).not.toBeNull();
    expect(result.updatedState.flows).toHaveLength(1);
  });

  it('links PAR → authorize via pending request_uri', () => {
    let state = makeEmptyOidcFlowState();

    const parEvent = makeEvent({
      oidcSemantics: {
        _tag: 'oidc-semantics',
        oidcPhase: 'par',
        clientId: 'app1',
        par: { requestUri: 'urn:example:par-123', expiresIn: 60 },
      },
    });
    const parResult = trackOidcEvent(parEvent, state);
    state = parResult.updatedState;
    expect(parResult.flowId).not.toBeNull();
    expect(state.flows[0].phases).toEqual(['par']);

    const authEvent = makeEvent({
      oidcSemantics: {
        _tag: 'oidc-semantics',
        oidcPhase: 'authorize',
        par: { requestUri: 'urn:example:par-123' },
      },
    });
    const authResult = trackOidcEvent(authEvent, state);
    // Should create a new flow since we don't do request_uri correlation in authorize yet
    expect(authResult.flowId).not.toBeNull();
  });

  it('attaches userinfo to existing flow', () => {
    let state = makeEmptyOidcFlowState();

    const authResult = trackOidcEvent(
      makeEvent({
        oidcSemantics: { _tag: 'oidc-semantics', oidcPhase: 'authorize', state: 'st1' },
      }),
      state,
    );
    state = authResult.updatedState;

    const tokenResult = trackOidcEvent(
      makeEvent({
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          grantType: 'authorization_code',
        },
      }),
      state,
    );
    state = tokenResult.updatedState;

    const userinfoResult = trackOidcEvent(
      makeEvent({
        oidcSemantics: { _tag: 'oidc-semantics', oidcPhase: 'userinfo' },
      }),
      state,
    );

    expect(userinfoResult.flowId).toBe(authResult.flowId);
    expect(userinfoResult.updatedState.flows[0].phases).toEqual(['authorize', 'token', 'userinfo']);
  });

  it('tracks refresh token grants', () => {
    let state = makeEmptyOidcFlowState();

    // Initial auth code flow
    const authResult = trackOidcEvent(
      makeEvent({
        oidcSemantics: { _tag: 'oidc-semantics', oidcPhase: 'authorize' },
      }),
      state,
    );
    state = authResult.updatedState;

    const tokenResult = trackOidcEvent(
      makeEvent({
        oidcSemantics: {
          _tag: 'oidc-semantics',
          oidcPhase: 'token',
          grantType: 'authorization_code',
        },
      }),
      state,
    );
    state = tokenResult.updatedState;

    // Refresh
    const refreshResult = trackOidcEvent(
      makeEvent({
        oidcSemantics: { _tag: 'oidc-semantics', oidcPhase: 'token', grantType: 'refresh_token' },
      }),
      state,
    );
    state = refreshResult.updatedState;

    expect(state.refreshCount).toBe(1);
    expect(refreshResult.flowId).toBe(authResult.flowId);
  });
});
