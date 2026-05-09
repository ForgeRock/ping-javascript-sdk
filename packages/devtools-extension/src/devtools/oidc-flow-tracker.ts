import type { AuthEvent, OidcSemantics } from '@forgerock/devtools-types';

export interface OidcFlowState {
  flows: OidcFlow[];
  pendingState: Map<string, string>;
  pendingCodeChallenge: Map<string, string>;
  pendingParUri: Map<string, string>;
  lastAuthCode: string | null;
  lastRefreshToken: string | null;
  refreshCount: number;
}

export interface OidcFlow {
  flowId: string;
  phases: string[];
  eventIds: string[];
  state?: string;
  clientId?: string;
}

export function makeEmptyOidcFlowState(): OidcFlowState {
  return {
    flows: [],
    pendingState: new Map(),
    pendingCodeChallenge: new Map(),
    pendingParUri: new Map(),
    lastAuthCode: null,
    lastRefreshToken: null,
    refreshCount: 0,
  };
}

export function trackOidcEvent(
  event: AuthEvent,
  flowState: OidcFlowState,
): { flowId: string | null; updatedState: OidcFlowState } {
  const semantics = event.oidcSemantics;
  if (!semantics) return { flowId: null, updatedState: flowState };

  const state = { ...flowState };

  switch (semantics.oidcPhase) {
    case 'authorize': {
      const flowId = event.flowId ?? `oidc-${crypto.randomUUID().slice(0, 8)}`;
      const flow: OidcFlow = {
        flowId,
        phases: ['authorize'],
        eventIds: [event.id],
        state: semantics.state,
        clientId: semantics.clientId,
      };
      state.flows = [...state.flows, flow];

      if (semantics.state) {
        state.pendingState = new Map(state.pendingState);
        state.pendingState.set(semantics.state, flowId);
      }
      if (semantics.pkce?.challengeMethod) {
        state.pendingCodeChallenge = new Map(state.pendingCodeChallenge);
        state.pendingCodeChallenge.set(flowId, semantics.pkce.challengeMethod);
      }

      return { flowId, updatedState: state };
    }

    case 'par': {
      const flowId = event.flowId ?? `oidc-${crypto.randomUUID().slice(0, 8)}`;
      const flow: OidcFlow = {
        flowId,
        phases: ['par'],
        eventIds: [event.id],
        state: semantics.state,
        clientId: semantics.clientId,
      };
      state.flows = [...state.flows, flow];

      if (semantics.par?.requestUri) {
        state.pendingParUri = new Map(state.pendingParUri);
        state.pendingParUri.set(semantics.par.requestUri, flowId);
      }

      return { flowId, updatedState: state };
    }

    case 'token': {
      // Try to correlate with existing flow via state or just use the latest authorize flow
      const matchedFlowId = findFlowForToken(semantics, state);
      if (matchedFlowId) {
        state.flows = state.flows.map((f) =>
          f.flowId === matchedFlowId
            ? { ...f, phases: [...f.phases, 'token'], eventIds: [...f.eventIds, event.id] }
            : f,
        );

        // Track refresh token rotation
        if (semantics.grantType === 'refresh_token') {
          state.refreshCount += 1;
        }

        return { flowId: matchedFlowId, updatedState: state };
      }

      // No matching flow — standalone token exchange
      const flowId = event.flowId ?? `oidc-${crypto.randomUUID().slice(0, 8)}`;
      state.flows = [
        ...state.flows,
        {
          flowId,
          phases: ['token'],
          eventIds: [event.id],
          clientId: semantics.clientId,
        },
      ];
      return { flowId, updatedState: state };
    }

    case 'userinfo':
    case 'revocation':
    case 'introspection':
    case 'end-session': {
      // Attach to the most recent flow
      const lastFlow = state.flows[state.flows.length - 1];
      if (lastFlow) {
        state.flows = state.flows.map((f, i) =>
          i === state.flows.length - 1
            ? {
                ...f,
                phases: [...f.phases, semantics.oidcPhase],
                eventIds: [...f.eventIds, event.id],
              }
            : f,
        );
        return { flowId: lastFlow.flowId, updatedState: state };
      }
      return { flowId: null, updatedState: state };
    }

    default:
      return { flowId: null, updatedState: state };
  }
}

function findFlowForToken(semantics: OidcSemantics, state: OidcFlowState): string | null {
  // If the authorize flow set a state param, and token body might reference it indirectly
  // In practice, match by the most recent authorize flow
  const authorizeFlows = state.flows.filter(
    (f) => f.phases.includes('authorize') || f.phases.includes('par'),
  );
  if (authorizeFlows.length > 0) {
    return authorizeFlows[authorizeFlows.length - 1].flowId;
  }

  // For refresh_token grants, match to the most recent token flow
  if (semantics.grantType === 'refresh_token') {
    const tokenFlows = state.flows.filter((f) => f.phases.includes('token'));
    if (tokenFlows.length > 0) {
      return tokenFlows[tokenFlows.length - 1].flowId;
    }
  }

  return null;
}
