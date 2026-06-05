/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { KeylessAuthElement, KeylessEnrollElement } from './recognize-sdk/index.js';
import { RecognizeErrorCode, createRecognizeError, mapWebError } from './errors.js';
import type {
  RecognizeError,
  RecognizeWcClient,
  RecognizeWcConfig,
  RecognizeWcInitOptions,
  RecognizeWcObserver,
  RecognizeWcUnsubscribe,
} from './recognize.types.js';

type RootEl = KeylessAuthElement | KeylessEnrollElement;

const CAMERA_ONLY_DISABLE_STEPS: string[] = [
  'bootstrap',
  'camera-instructions',
  'done',
  'error',
  'microphone-permission',
  'server-computation',
  'stm-choice',
  'stm-qrcode',
];

/**
 * @function recognize - Returns a client to interact with the PingOne Recognize SDK web components
 * @param {RecognizeWcConfig} config - Configuration for the PingOne Recognize SDK
 * @returns {RecognizeWcClient}
 */
export function recognize(config: RecognizeWcConfig): RecognizeWcClient {
  const effectiveConfig: RecognizeWcConfig = { disableSteps: CAMERA_ONLY_DISABLE_STEPS, ...config };
  let element: RootEl | null = null;
  let abortController: AbortController | null = null;
  const observers: Set<RecognizeWcObserver> = new Set();

  const dispatch = (type: string, detail: unknown): void => {
    for (const observer of observers) {
      observer.next({ type, detail } as Parameters<RecognizeWcObserver['next']>[0]);
    }
  };

  const attachListeners = (el: RootEl): void => {
    abortController = new AbortController();
    const { signal } = abortController;

    el.addEventListener('step-change', (e) => dispatch('step-change', (e as CustomEvent).detail), {
      signal,
    });
    el.addEventListener(
      'finished',
      (e) => {
        const detail = (e as CustomEvent).detail;
        dispatch('finished', detail);
        for (const observer of observers) observer.complete?.(detail);
        observers.clear();
      },
      { signal },
    );
    el.addEventListener(
      'error',
      (e) => {
        const event = e as ErrorEvent;
        const reason = event.error?.message as string | undefined;
        const err = createRecognizeError(mapWebError(reason), event.error);
        for (const observer of observers) observer.error?.(err);
        observers.clear();
      },
      { signal },
    );
    el.addEventListener(
      'frame-results',
      (e) => dispatch('frame-results', (e as CustomEvent).detail),
      { signal },
    );
    el.addEventListener(
      'video-frame-quality',
      (e) => dispatch('video-frame-quality', (e as CustomEvent).detail),
      { signal },
    );
    el.addEventListener('ws-open', (e) => dispatch('ws-open', (e as CustomEvent).detail), {
      signal,
    });
    el.addEventListener('ws-close', (e) => dispatch('ws-close', (e as CustomEvent).detail), {
      signal,
    });
  };

  const applyConfig = (el: RootEl): void => {
    const target = el as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(effectiveConfig)) {
      if (v !== undefined) {
        target[k === 'key' ? 'publicKey' : k] = v;
      }
    }
  };

  const client: RecognizeWcClient = {
    subscribe: (observer: RecognizeWcObserver): RecognizeWcUnsubscribe => {
      observers.add(observer);
      return () => observers.delete(observer);
    },

    async init(options: RecognizeWcInitOptions): Promise<void | RecognizeError> {
      if (element !== null) {
        return createRecognizeError(RecognizeErrorCode.ALREADY_INITIALIZED);
      }

      try {
        await import('./recognize-sdk/index.js' as string);
      } catch {
        return createRecognizeError(RecognizeErrorCode.SDK_ERROR);
      }

      if (options.mode === 'attach') {
        const tag = (options.element as HTMLElement).tagName;
        if (tag !== 'KL-AUTH' && tag !== 'KL-ENROLL') {
          return createRecognizeError(RecognizeErrorCode.INVALID_ELEMENT);
        }
        element = options.element as RootEl;
        element.username = options.username;
        applyConfig(element);
        attachListeners(element);
      } else {
        const tag = options.type === 'auth' ? 'kl-auth' : 'kl-enroll';
        element = document.createElement(tag) as RootEl;
        element.username = options.username;
        applyConfig(element);
        attachListeners(element);
        options.container.appendChild(element);
      }
    },

    dispose: (): void => {
      if (element === null) return;

      abortController?.abort();
      abortController = null;
      element.remove();
      element = null;
      observers.clear();
    },
  };

  return client;
}
