/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { RecognizeError } from './classes/recognize-error.js';
import { CAMERA_ONLY_DISABLE_STEPS } from './defs/constants.js';
import { RecognizeErrorCode } from './defs/recognize-error-code.js';
import { createRecognizeError } from './functions/create-recognize-error.js';
import type { KeylessFinishedEvent } from './recognize-sdk/index.js';
import type {
  RecognizeRootElement,
  RecognizeWcClient,
  RecognizeWcConfig,
  RecognizeWcInitOptions,
  RecognizeWcObserver,
  RecognizeWcUnsubscribe,
} from './recognize.types.js';

/**
 * @function recognize - Returns a client to interact with the PingOne Recognize SDK web components
 * @param {RecognizeWcConfig} config - Configuration for the PingOne Recognize SDK
 * @returns {RecognizeWcClient}
 */
export function recognize(config: RecognizeWcConfig): RecognizeWcClient {
  const effectiveConfig: RecognizeWcConfig = { disableSteps: CAMERA_ONLY_DISABLE_STEPS, ...config };
  const observers: Set<RecognizeWcObserver> = new Set();

  let element: RecognizeRootElement | null = null;
  let abortController: AbortController | null = null;

  const dispatch = (type: string, detail: unknown): void => {
    for (const observer of observers) {
      observer.next({ type, detail } as Parameters<RecognizeWcObserver['next']>[0]);
    }
  };

  const attachListeners = (el: RecognizeRootElement): void => {
    abortController = new AbortController();
    const { signal } = abortController;

    const onEvent = (type: string) => {
      return (event: CustomEvent) => dispatch(type, event.detail);
    };

    const onFinished = (event: KeylessFinishedEvent) => {
      for (const observer of observers) observer.complete?.(event.detail);
      observers.clear();
    };

    const onError = (e: ErrorEvent) => {
      const err = createRecognizeError(e);
      for (const observer of observers) observer.error?.(err);
      observers.clear();
    };

    el.addEventListener('error', onError, { signal });
    el.addEventListener('finished', onFinished, { signal });
    el.addEventListener('step-change', onEvent('step-change'), { signal });
    el.addEventListener('frame-results', onEvent('frame-results'), { signal });
    el.addEventListener('video-frame-quality', onEvent('video-frame-quality'), { signal });
    el.addEventListener('ws-open', onEvent('ws-open'), { signal });
    el.addEventListener('ws-close', onEvent('ws-close'), { signal });
  };

  const applyConfig = (el: RecognizeRootElement): void => {
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
        throw new Error(
          'recognize: init() called more than once — call dispose() before re-initializing',
        );
      }

      try {
        await import('./recognize-sdk/index.js' as string);
      } catch {
        return createRecognizeError(RecognizeErrorCode.SDK_ERROR);
      }

      if (options.mode === 'attach') {
        const tag = options.element.tagName;

        if (tag !== 'KL-AUTH' && tag !== 'KL-ENROLL') {
          throw new Error(
            `recognize: invalid element <${tag.toLowerCase()}> — options.element must be a <kl-auth> or <kl-enroll> custom element`,
          );
        }

        element = options.element as RecognizeRootElement;
        element.username = options.username;

        applyConfig(element);
        attachListeners(element);
      } else {
        const tag = options.type === 'auth' ? 'kl-auth' : 'kl-enroll';

        element = document.createElement(tag) as RecognizeRootElement;
        element.username = options.username;

        applyConfig(element);
        attachListeners(element);

        options.container.appendChild(element);
      }
    },

    dispose: (): void => {
      if (element === null) return;

      abortController = null;
      element.remove();
      element = null;
      observers.clear();
    },
  };

  return client;
}
