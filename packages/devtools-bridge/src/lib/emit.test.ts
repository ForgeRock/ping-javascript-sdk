import { describe, it, expect } from 'vitest';
import type { AuthEvent } from '@forgerock/devtools-types';
import { DEVTOOLS_EVENT_NAME, emitAuthEvent } from './emit.js';

// Minimal valid AuthEvent fixture — _tag: 'sdk' satisfies the SdkDataSchema discriminant.
const makeEvent = (): AuthEvent => ({
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
});

describe('emitAuthEvent', () => {
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
});
