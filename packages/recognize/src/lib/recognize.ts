/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { RecognizeError } from './classes/recognize-error.js';
import { CAMERA_ONLY_DISABLE_STEPS } from './defs/constants.js';
import { RecognizeErrorCode } from './defs/recognize-error-code.js';
import { RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP } from './defs/recognize-sdk-to-recognize-proxy-error-map.js';
import type { KeylessFinishedEvent } from './recognize-sdk/index.js';
import type {
  RecognizeWebComponent,
  RecognizeWebComponentClient,
  RecognizeWebComponentConfiguration,
  RecognizeWebComponentEvent,
  RecognizeWebComponentInitOptions,
  RecognizeWebComponentObserver,
  RecognizeWebComponentUnsubscribe,
} from './recognize.types.js';

/**
 * @function recognize - Returns a client to interact with the PingOne Recognize SDK web components
 * @param {RecognizeWebComponentConfiguration} configuration - Configuration for the PingOne Recognize SDK
 * @returns {RecognizeWebComponentClient}
 */
export function recognize(
  configuration: RecognizeWebComponentConfiguration,
): RecognizeWebComponentClient {
  const config: RecognizeWebComponentConfiguration = {
    disableSteps: CAMERA_ONLY_DISABLE_STEPS,
    ...configuration,
  };
  const observers: Set<RecognizeWebComponentObserver> = new Set();

  let element: RecognizeWebComponent | null = null;
  let aborter: AbortController | null = null;

  const dispatch = (type: RecognizeWebComponentEvent['type'], detail: any): void => {
    for (const observer of observers) {
      observer.next({ type, detail });
    }
  };

  const addEventListeners = (element: RecognizeWebComponent): void => {
    aborter = new AbortController();

    const onEvent = (type: RecognizeWebComponentEvent['type']) => {
      return (event: CustomEvent) => dispatch(type, event.detail);
    };

    const onFinished = (event: KeylessFinishedEvent) => {
      for (const observer of observers) {
        observer.complete?.(event.detail);
      }

      observers.clear();
    };

    const onError = (e: ErrorEvent) => {
      const code: RecognizeErrorCode =
        RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP[e.error.message] ?? RecognizeErrorCode.SDK_ERROR;

      const error: RecognizeError = new RecognizeError(code, { cause: e.error });

      for (const observer of observers) {
        observer.error?.(error);
      }

      observers.clear();
    };

    const options: AddEventListenerOptions = { signal: aborter.signal };

    element.addEventListener('begin-stream', onEvent('begin-stream'), options);
    element.addEventListener('error', onError, options);
    element.addEventListener('finished', onFinished, options);
    element.addEventListener('step-change', onEvent('step-change'), options);
    element.addEventListener('frame-results', onEvent('frame-results'), options);
    element.addEventListener('stop-stream', onEvent('stop-stream'), options);
    element.addEventListener('video-frame-quality', onEvent('video-frame-quality'), options);
    element.addEventListener('ws-open', onEvent('ws-open'), options);
    element.addEventListener('ws-close', onEvent('ws-close'), options);
  };

  const setAttributes = (element: RecognizeWebComponent): void => {
    for (const [k, v] of Object.entries(config)) {
      if (k === 'key') {
        element.publicKey = v;
      } else {
        element[k as keyof RecognizeWebComponentConfiguration] = v;
      }
    }
  };

  const client: RecognizeWebComponentClient = {
    subscribe: (observer: RecognizeWebComponentObserver): RecognizeWebComponentUnsubscribe => {
      observers.add(observer);
      return () => observers.delete(observer);
    },

    async init(options: RecognizeWebComponentInitOptions): Promise<void> {
      if (element !== null) {
        throw new RecognizeError(RecognizeErrorCode.SDK_ERROR, {
          cause: 'init() called more than once — call dispose() before re-initializing',
        });
      }

      try {
        await import('./recognize-sdk/index.js');
      } catch (error: unknown) {
        throw new RecognizeError(RecognizeErrorCode.SDK_WEB_ASSEMBLY_IMPORT_FAILED, {
          cause: error,
        });
      }

      if (options.mode === 'attach') {
        const tag: string = options.element.tagName;

        if (tag !== 'KL-AUTH' && tag !== 'KL-ENROLL') {
          throw new RecognizeError(RecognizeErrorCode.SDK_ERROR, {
            cause: `invalid element <${tag.toLowerCase()}> — options.element must be a <kl-auth> or <kl-enroll> custom element`,
          });
        }

        element = options.element as RecognizeWebComponent;
        element.username = options.username;

        setAttributes(element);
        addEventListeners(element);
      } else {
        const tag: 'kl-auth' | 'kl-enroll' = options.type === 'auth' ? 'kl-auth' : 'kl-enroll';

        element = document.createElement(tag);
        element.username = options.username;

        setAttributes(element);
        addEventListeners(element);

        options.container.appendChild(element);
      }
    },

    dispose: (): void => {
      if (element === null) return;

      aborter = null;

      element.remove();
      element = null;

      observers.clear();
    },
  };

  return client;
}

export { RecognizeError };
