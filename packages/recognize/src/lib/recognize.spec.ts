/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

/// <reference types="vitest/globals" />

import { RecognizeErrorCode } from './defs/recognize-error-code.js';
import { recognize } from './recognize.js';
import { RecognizeWebComponentConfiguration } from './recognize.types.js';

vi.mock('./recognize-sdk/index.js', () => ({}));

const CONFIG: RecognizeWebComponentConfiguration = {
  authorizationToken: 'USER_AUTHORIZATION_FROM_CUSTOMER',
  customer: 'CUSTOMER_NAME',
  key: 'IMAGE_ENCRYPTION_PUBLIC_KEY',
  keyID: 'IMAGE_ENCRYPTION_KEY_ID',
  transactionData: 'DATA_FROM_CUSTOMER_SERVER_TO_BE_SIGNED',
  wsURL: 'ws://localhost',
};

describe('recognize — subscribe / unsubscribe', () => {
  it('returns a client with subscribe, init, and dispose', () => {
    const client = recognize(CONFIG);

    expect(typeof client.subscribe).toBe('function');
    expect(typeof client.init).toBe('function');
    expect(typeof client.dispose).toBe('function');
  });

  it('subscribe returns an unsubscribe function', () => {
    const client = recognize(CONFIG);
    const unsub = client.subscribe({ next: vi.fn() });

    expect(typeof unsub).toBe('function');
  });

  it('unsubscribe removes the observer so it no longer receives events', async () => {
    const client = recognize(CONFIG);
    const next = vi.fn();
    const unsub = client.subscribe({ next });

    unsub();
    await client.init({
      mode: 'mount',
      container: document.createElement('div'),
      type: 'auth',
      username: 'user',
    });

    expect(next).not.toHaveBeenCalled();
  });
});

describe('recognize — init', () => {
  it('throws if init is called twice without dispose', async () => {
    const client = recognize(CONFIG);
    const container = document.createElement('div');
    document.body.appendChild(container);

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });

    try {
      await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(Error);

      if (e instanceof Error) {
        expect(e.message).toBe('SDK_ERROR');
        expect(e.cause).toBe(
          'init() called more than once — call dispose() before re-initializing',
        );
      }
    }

    client.dispose();
  });

  it('mounts a kl-auth element for auth type', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });

    expect(container.querySelector('kl-auth')).not.toBeNull();

    client.dispose();
  });

  it('mounts a kl-enroll element for enroll type', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);

    await client.init({ mode: 'mount', container, type: 'enroll', username: 'user' });

    expect(container.querySelector('kl-enroll')).not.toBeNull();

    client.dispose();
  });

  it('throws for attach mode with an unsupported element', async () => {
    const client = recognize(CONFIG);
    const div = document.createElement('div');

    try {
      await client.init({ mode: 'attach', element: div, username: 'user' });
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(Error);

      if (e instanceof Error) {
        expect(e.message).toBe('SDK_ERROR');
        expect(e.cause).toBe(
          'invalid element <div> — options.element must be a <kl-auth> or <kl-enroll> custom element',
        );
      }
    }
  });

  it('attaches to an existing kl-auth element in attach mode', async () => {
    const client = recognize(CONFIG);
    const el = document.createElement('kl-auth');
    document.body.appendChild(el);

    await client.init({ mode: 'attach', element: el, username: 'user' });

    client.dispose();
  });
});

describe('recognize — dispose', () => {
  it('removes the mounted element from the DOM', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    expect(container.querySelector('kl-auth')).not.toBeNull();

    client.dispose();
    expect(container.querySelector('kl-auth')).toBeNull();
  });

  it('stops delivering events after dispose', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);
    const next = vi.fn();
    client.subscribe({ next });

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    const el = container.querySelector('kl-auth')!;

    client.dispose();
    el.dispatchEvent(new CustomEvent('step-change', { detail: {} }));

    expect(next).not.toHaveBeenCalled();
  });

  it('allows re-initialization after dispose', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    client.dispose();

    await expect(
      client.init({ mode: 'mount', container, type: 'auth', username: 'user' }),
    ).resolves.not.toThrow();

    client.dispose();
  });
});

describe('recognize — error observer', () => {
  it('calls observer.error with a RecognizeError when the element emits an error event', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);
    const errorFn = vi.fn();
    client.subscribe({ next: vi.fn(), error: errorFn });

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    const el = container.querySelector('kl-auth')!;

    const originalError = new Error('camera fail');
    el.dispatchEvent(new ErrorEvent('error', { error: originalError }));

    expect(errorFn).toHaveBeenCalledOnce();
    const receivedError = errorFn.mock.calls[0][0];
    expect(receivedError.name).toBe('RecognizeError');
    expect(receivedError.code).toBe(RecognizeErrorCode.SDK_ERROR);

    client.dispose();
  });

  it('maps a known SDK reason in the error event to the correct code', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);
    const errorFn = vi.fn();
    client.subscribe({ next: vi.fn(), error: errorFn });

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    const el = container.querySelector('kl-auth')!;

    const event = new ErrorEvent('error', { error: new Error('MEDIA_STREAM_NOT_ALLOWED') });
    el.dispatchEvent(event);

    const receivedError = errorFn.mock.calls[0][0];
    expect(receivedError.code).toBe(RecognizeErrorCode.CAMERA_PERMISSION_DENIED);

    client.dispose();
  });

  it('clears all observers after an error', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = recognize(CONFIG);
    const next = vi.fn();
    const errorFn = vi.fn();
    client.subscribe({ next, error: errorFn });

    await client.init({ mode: 'mount', container, type: 'auth', username: 'user' });
    const el = container.querySelector('kl-auth')!;

    el.dispatchEvent(new ErrorEvent('error', { error: new Error('fail') }));
    el.dispatchEvent(new CustomEvent('step-change', { detail: {} }));

    expect(next).not.toHaveBeenCalled();

    client.dispose();
  });
});
