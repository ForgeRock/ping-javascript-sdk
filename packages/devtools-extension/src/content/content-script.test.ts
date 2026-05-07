import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('content-script (MAIN world)', () => {
  beforeEach(() => {
    vi.stubGlobal('__PING_DEVTOOLS_EXTENSION__', undefined);
  });

  it('sets __PING_DEVTOOLS_EXTENSION__ on window', async () => {
    await import('./content-script.js');
    expect(window.__PING_DEVTOOLS_EXTENSION__).toBe(true);
  });

  it('relays pingDevtools CustomEvent payload via postMessage', async () => {
    const postSpy = vi.spyOn(window, 'postMessage');
    await import('./content-script.js');

    const payload = { id: 'test', type: 'sdk:node-change' };
    window.dispatchEvent(new CustomEvent('pingDevtools', { detail: payload }));

    expect(postSpy).toHaveBeenCalledWith({ __pingDevtools: true, payload }, '*');
  });
});
