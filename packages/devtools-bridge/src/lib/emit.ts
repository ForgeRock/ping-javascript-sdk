import type { AuthEvent } from '@forgerock/devtools-types';

export const DEVTOOLS_EVENT_NAME = 'pingDevtools';

export interface DevtoolsOptions {
  consoleLog?: boolean;
}

declare global {
  interface Window {
    __PING_DEVTOOLS_STATE__?: AuthEvent[];
  }
}

let options: DevtoolsOptions = {};

export function configureDevtools(opts: DevtoolsOptions): void {
  options = opts;
}

export function emitAuthEvent(event: AuthEvent): void {
  if (typeof window === 'undefined') return;

  if (!window.__PING_DEVTOOLS_STATE__) {
    window.__PING_DEVTOOLS_STATE__ = [];
  }
  window.__PING_DEVTOOLS_STATE__.push(event);

  if (options.consoleLog) {
    console.log('[ping-devtools]', event.type, event);
  }

  window.dispatchEvent(new CustomEvent(DEVTOOLS_EVENT_NAME, { detail: event }));
}

export function emitConfigEvent(config: object): void {
  emitAuthEvent({
    id: crypto.randomUUID(),
    timestamp: performance.now(),
    type: 'sdk:config',
    source: 'sdk',
    flowId: null,
    causedBy: null,
    data: { _tag: 'sdk-config', config },
    flags: { isCors: false, isError: false, isAuthRelated: true },
  });
}
