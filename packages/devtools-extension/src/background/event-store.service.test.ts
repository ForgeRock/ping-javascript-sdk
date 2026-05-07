import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { EventStoreService, EventStoreLive, makeEmptyFlowState } from './event-store.service.js';
import type { AuthEvent } from '@forgerock/devtools-types';

const makeEvent = (overrides: Partial<AuthEvent> = {}): AuthEvent => ({
  id: 'e1',
  timestamp: 100,
  type: 'network:response',
  source: 'network',
  flowId: null,
  causedBy: null,
  data: {
    _tag: 'network',
    url: '/authorize',
    method: 'POST',
    status: 200,
    requestHeaders: {},
    responseHeaders: {},
    duration: 50,
  },
  flags: { isCors: false, isError: false, isAuthRelated: true },
  ...overrides,
});

describe('EventStoreService', () => {
  it('appends events to state', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent());
      yield* store.append(makeEvent({ id: 'e2' }));
      return yield* store.getState();
    });

    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));

    expect(state.events).toHaveLength(2);
    expect(state.events[0].id).toBe('e1');
  });

  it('increments errorCount for error events', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(
        makeEvent({ flags: { isCors: false, isError: true, isAuthRelated: true } }),
      );
      return yield* store.getState();
    });

    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.errorCount).toBe(1);
  });

  it('clears state', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent());
      yield* store.clear();
      return yield* store.getState();
    });

    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.events).toHaveLength(0);
  });
});

describe('lastSdkEventId tracking', () => {
  it('sets lastSdkEventId when an sdk:node-change event is appended', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(
        makeEvent({
          id: 'sdk-1',
          type: 'sdk:node-change',
          source: 'sdk',
          data: { _tag: 'sdk', nodeStatus: 'continue' },
        }),
      );
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.lastSdkEventId).toBe('sdk-1');
  });

  it('does not update lastSdkEventId for network events', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'net-1' }));
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.lastSdkEventId).toBeNull();
  });

  it('updates lastSdkEventId to the most recent sdk event', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(
        makeEvent({
          id: 'sdk-1',
          type: 'sdk:node-change',
          source: 'sdk',
          data: { _tag: 'sdk', nodeStatus: 'continue' },
        }),
      );
      yield* store.append(
        makeEvent({
          id: 'sdk-2',
          type: 'sdk:node-change',
          source: 'sdk',
          data: { _tag: 'sdk', nodeStatus: 'success' },
        }),
      );
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.lastSdkEventId).toBe('sdk-2');
  });
});
