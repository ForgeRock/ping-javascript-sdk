import { describe, it, expect, vi } from 'vitest';
import { Effect, Ref, pipe } from 'effect';
import { handleMessage } from './message-handler.js';
import { EventStoreService, makeEmptyFlowState } from './event-store.service.js';
import type { AuthEvent, FlowState } from '@forgerock/devtools-types';
import { Layer } from 'effect';

// A test-only Layer that replaces persist/rehydrate with no-ops (no chrome.storage)
const TestStoreLive = Layer.effect(
  EventStoreService,
  pipe(
    Ref.make<FlowState>(makeEmptyFlowState()),
    Effect.map((stateRef) => ({
      append: (event: AuthEvent) =>
        Ref.update(stateRef, (s) => ({
          ...s,
          events: [...s.events, event],
          flowId: s.flowId ?? event.flowId,
          lastSdkEventId: event.type === 'sdk:node-change' ? event.id : s.lastSdkEventId,
        })),
      getState: () => Ref.get(stateRef),
      clear: () => Ref.set(stateRef, makeEmptyFlowState()),
      persist: () => Effect.void,
      rehydrate: () => Effect.void,
    })),
  ),
);

function run<A>(effect: Effect.Effect<A, never, EventStoreService>): Promise<A> {
  return Effect.runPromise(Effect.provide(effect, TestStoreLive));
}

const makeNetworkHarEntry = (url = 'https://auth.example.com/authorize') => ({
  request: {
    url,
    method: 'POST',
    headers: [{ name: 'content-type', value: 'application/json' }],
  },
  response: {
    status: 200,
    headers: [{ name: 'x-request-id', value: 'abc' }],
    content: { text: '{"access_token":"tok"}' },
  },
  time: 123,
});

const makeSdkEvent = (overrides: Partial<AuthEvent> = {}): AuthEvent => ({
  id: 'sdk-1',
  timestamp: 100,
  type: 'sdk:node-change',
  source: 'sdk',
  flowId: 'flow-1',
  causedBy: null,
  data: { _tag: 'sdk', nodeStatus: 'continue' },
  flags: { isCors: false, isError: false, isAuthRelated: true },
  ...overrides,
});

describe('handleMessage', () => {
  describe('NETWORK_EVENT', () => {
    it('returns the event when URL is auth-related', async () => {
      const result = await run(
        handleMessage({
          type: 'NETWORK_EVENT',
          payload: makeNetworkHarEntry('https://auth.example.com/authorize'),
        }),
      );

      expect(result).not.toBeNull();
      const event = result as AuthEvent;
      expect(event.type).toBe('network:response');
      expect(event.flags.isAuthRelated).toBe(true);
    });

    it('returns null when URL is not auth-related', async () => {
      const result = await run(
        handleMessage({
          type: 'NETWORK_EVENT',
          payload: makeNetworkHarEntry('https://api.example.com/users'),
        }),
      );

      expect(result).toBeNull();
    });

    it('sets causedBy to the lastSdkEventId', async () => {
      const program = Effect.gen(function* () {
        // First, append an SDK event to set lastSdkEventId
        yield* handleMessage({ type: 'SDK_EVENT', payload: makeSdkEvent({ id: 'sdk-42' }) });

        // Then process a network event
        return yield* handleMessage({
          type: 'NETWORK_EVENT',
          payload: makeNetworkHarEntry('https://auth.example.com/davinci/flow'),
        });
      });

      const result = await run(program);
      expect(result).not.toBeNull();
      expect((result as AuthEvent).causedBy).toBe('sdk-42');
    });
  });

  describe('SDK_EVENT', () => {
    it('accepts and stores a valid SDK event', async () => {
      const event = makeSdkEvent();
      const result = await run(handleMessage({ type: 'SDK_EVENT', payload: event }));

      expect(result).not.toBeNull();
      expect((result as AuthEvent).id).toBe('sdk-1');
    });

    it('returns null for a malformed SDK event', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const result = await run(handleMessage({ type: 'SDK_EVENT', payload: { bad: 'data' } }));

      expect(result).toBeNull();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it('persists the event to the store', async () => {
      const program = Effect.gen(function* () {
        const store = yield* EventStoreService;
        yield* handleMessage({ type: 'SDK_EVENT', payload: makeSdkEvent() });
        return yield* store.getState();
      });

      const state = await run(program);
      expect(state.events).toHaveLength(1);
    });
  });

  describe('CLEAR', () => {
    it('clears the event store', async () => {
      const program = Effect.gen(function* () {
        const store = yield* EventStoreService;
        yield* handleMessage({ type: 'SDK_EVENT', payload: makeSdkEvent() });
        yield* handleMessage({ type: 'CLEAR' });
        return yield* store.getState();
      });

      const state = await run(program);
      expect(state.events).toHaveLength(0);
    });

    it('returns null', async () => {
      const result = await run(handleMessage({ type: 'CLEAR' }));
      expect(result).toBeNull();
    });
  });

  describe('GET_STATE', () => {
    it('returns the current flow state', async () => {
      const program = Effect.gen(function* () {
        yield* handleMessage({ type: 'SDK_EVENT', payload: makeSdkEvent() });
        return yield* handleMessage({ type: 'GET_STATE' });
      });

      const result = await run(program);
      expect(result).toHaveProperty('events');
      expect((result as FlowState).events).toHaveLength(1);
    });

    it('returns empty state when nothing has been appended', async () => {
      const result = await run(handleMessage({ type: 'GET_STATE' }));
      expect(result).toHaveProperty('events');
      expect((result as FlowState).events).toHaveLength(0);
    });
  });
});
