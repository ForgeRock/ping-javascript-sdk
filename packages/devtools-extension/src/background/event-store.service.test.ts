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

describe('updateSummary (via append)', () => {
  it('increments nodeCount for sdk:node-change events', async () => {
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
    expect(state.summary.nodeCount).toBe(2);
  });

  it('does not increment nodeCount for non-node-change events', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'net-1' }));
      yield* store.append(
        makeEvent({
          id: 'j-1',
          type: 'sdk:journey-step',
          source: 'sdk',
          data: { _tag: 'journey', stepType: 'Step' },
        }),
      );
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.nodeCount).toBe(0);
  });

  it('sets sdkConnected to true after an sdk:node-change event', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      const before = yield* store.getState();
      yield* store.append(
        makeEvent({
          id: 'sdk-1',
          type: 'sdk:node-change',
          source: 'sdk',
          data: { _tag: 'sdk', nodeStatus: 'continue' },
        }),
      );
      const after = yield* store.getState();
      return { before: before.summary.sdkConnected, after: after.summary.sdkConnected };
    });
    const result = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(result.before).toBe(false);
    expect(result.after).toBe(true);
  });

  it('accumulates corsFlags from CORS network events', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(
        makeEvent({
          id: 'cors-1',
          flags: { isCors: true, isError: true, isAuthRelated: true },
          data: {
            _tag: 'network',
            url: 'https://auth.example.com/token',
            method: 'POST',
            status: 0,
            requestHeaders: {},
            responseHeaders: {},
            duration: 0,
            corsFlag: {
              url: 'https://auth.example.com/token',
              reason: 'status-zero',
              method: 'POST',
            },
          },
        }),
      );
      yield* store.append(
        makeEvent({
          id: 'cors-2',
          flags: { isCors: true, isError: true, isAuthRelated: true },
          data: {
            _tag: 'network',
            url: 'https://auth.example.com/authorize',
            method: 'GET',
            status: 200,
            requestHeaders: { origin: 'https://app.example.com' },
            responseHeaders: {},
            duration: 50,
            corsFlag: {
              url: 'https://auth.example.com/authorize',
              reason: 'missing-allow-origin',
              method: 'GET',
            },
          },
        }),
      );
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.corsFlags).toHaveLength(2);
    expect(state.summary.corsFlags[0].reason).toBe('status-zero');
    expect(state.summary.corsFlags[1].reason).toBe('missing-allow-origin');
  });

  it('does not add corsFlag for non-cors events', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'net-1' }));
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.corsFlags).toHaveLength(0);
  });

  it('calculates duration as max - min timestamp', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'e1', timestamp: 1000 }));
      yield* store.append(makeEvent({ id: 'e2', timestamp: 1500 }));
      yield* store.append(makeEvent({ id: 'e3', timestamp: 3000 }));
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.duration).toBe(2000);
  });

  it('duration is 0 for a single event', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'e1', timestamp: 1000 }));
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.duration).toBe(0);
  });

  it('sets flowId from first event with a non-null flowId', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'e1', flowId: null }));
      yield* store.append(makeEvent({ id: 'e2', flowId: 'flow-abc' }));
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.flowId).toBe('flow-abc');
  });

  it('does not overwrite flowId once set', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(makeEvent({ id: 'e1', flowId: 'flow-1' }));
      yield* store.append(makeEvent({ id: 'e2', flowId: 'flow-2' }));
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.flowId).toBe('flow-1');
  });

  it('counts multiple error events', async () => {
    const program = Effect.gen(function* () {
      const store = yield* EventStoreService;
      yield* store.append(
        makeEvent({ id: 'e1', flags: { isCors: false, isError: true, isAuthRelated: true } }),
      );
      yield* store.append(
        makeEvent({ id: 'e2', flags: { isCors: false, isError: true, isAuthRelated: true } }),
      );
      yield* store.append(
        makeEvent({ id: 'e3', flags: { isCors: false, isError: false, isAuthRelated: true } }),
      );
      return yield* store.getState();
    });
    const state = await Effect.runPromise(Effect.provide(program, EventStoreLive));
    expect(state.summary.errorCount).toBe(2);
  });
});
