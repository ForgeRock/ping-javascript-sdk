import { Context, Effect, Layer, Ref, pipe } from 'effect';
import type { AuthEvent, FlowState } from '@forgerock/devtools-types';
import type { OidcConfig } from '../devtools/oidc-discovery.js';

export interface ExtendedFlowState extends FlowState {
  oidcConfig: OidcConfig | null;
  lastOidcEventId: string | null;
}

export function makeEmptyFlowState(): ExtendedFlowState {
  return {
    flowId: null,
    capturedAt: new Date().toISOString(),
    events: [],
    summary: { nodeCount: 0, errorCount: 0, corsFlags: [], duration: 0, sdkConnected: false },
    lastSdkEventId: null,
    oidcConfig: null,
    lastOidcEventId: null,
  };
}

function updateSummary(state: ExtendedFlowState, event: AuthEvent): ExtendedFlowState {
  const summary = { ...state.summary };

  if (event.flags.isError) summary.errorCount += 1;
  if (event.type === 'sdk:node-change') {
    summary.nodeCount += 1;
    summary.sdkConnected = true;
  }
  if (event.flags.isCors && event.data._tag === 'network' && event.data.corsFlag) {
    summary.corsFlags = [...summary.corsFlags, event.data.corsFlag];
  }

  const timestamps = [...state.events, event].map((e) => e.timestamp);
  summary.duration = timestamps.length > 1 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;

  return {
    ...state,
    flowId: state.flowId ?? event.flowId,
    events: [...state.events, event],
    summary,
    lastSdkEventId: event.type === 'sdk:node-change' ? event.id : state.lastSdkEventId,
  };
}

export interface EventStoreServiceShape {
  append: (event: AuthEvent) => Effect.Effect<void>;
  getState: () => Effect.Effect<ExtendedFlowState>;
  clear: () => Effect.Effect<void>;
  persist: () => Effect.Effect<void>;
  rehydrate: () => Effect.Effect<void>;
  setOidcConfig: (config: OidcConfig) => Effect.Effect<void>;
  setLastOidcEventId: (id: string) => Effect.Effect<void>;
}

export class EventStoreService extends Context.Tag('EventStoreService')<
  EventStoreService,
  EventStoreServiceShape
>() {}

export const EventStoreLive = Layer.effect(
  EventStoreService,
  pipe(
    Ref.make<ExtendedFlowState>(makeEmptyFlowState()),
    Effect.map((stateRef) => ({
      append: (event: AuthEvent) => Ref.update(stateRef, (s) => updateSummary(s, event)),
      getState: () => Ref.get(stateRef),
      clear: () => Ref.set(stateRef, makeEmptyFlowState()),
      persist: () =>
        pipe(
          Ref.get(stateRef),
          Effect.flatMap((state) =>
            Effect.tryPromise(() => chrome.storage.local.set({ 'ping:auth-flow': state })),
          ),
          Effect.orDie,
        ),
      rehydrate: () =>
        pipe(
          Effect.tryPromise(() => chrome.storage.local.get('ping:auth-flow')),
          Effect.orDie,
          Effect.flatMap((result) => {
            const stored = result['ping:auth-flow'] as ExtendedFlowState | undefined;
            return stored ? Ref.set(stateRef, stored) : Effect.void;
          }),
        ),
      setOidcConfig: (config: OidcConfig) =>
        Ref.update(stateRef, (s) => ({ ...s, oidcConfig: config })),
      setLastOidcEventId: (id: string) =>
        Ref.update(stateRef, (s) => ({ ...s, lastOidcEventId: id })),
    })),
  ),
);
