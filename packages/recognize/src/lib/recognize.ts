/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { CAMERA_ONLY_DISABLE_STEPS } from './defs/constants.js';
import { RecognizeErrorCode } from './defs/recognize-error-code.js';
import { RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP } from './defs/recognize-sdk-to-recognize-proxy-error-map.js';
import { createRecognizeError } from './functions/create-recognize-error.js';
import { setAttributes } from './functions/set-attributes.js';
import type {
  KeylessRecognitionFailureEvent,
  KeylessStepChangeEvent,
  KeylessSuccessEvent,
  KeylessVideoFrameQualityEvent,
} from './recognize-sdk/index.js';
import { KeylessRecoverableErrorEvent } from './recognize-sdk/index.js';
import type {
  RecognizeError,
  RecognizeErrorCodeValue,
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

  const dispatch = (event: RecognizeWebComponentEvent): void => {
    for (const observer of observers) {
      observer.next(event);
    }
  };

  const addEventListeners = (element: RecognizeWebComponent): void => {
    aborter = new AbortController();

    const onError = (event: ErrorEvent): void => {
      if (event instanceof KeylessRecoverableErrorEvent) {
        element?.dispose();
      }

      const code: RecognizeErrorCodeValue =
        RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP[event.error?.message] ??
        RecognizeErrorCode.SDK_ERROR;

      const error: RecognizeError = createRecognizeError(code, { cause: event.error });

      for (const observer of observers) {
        observer.error?.(error);
      }

      observers.clear();
    };

    const onRecognitionFailure = (event: KeylessRecognitionFailureEvent): void => {
      return onError(
        new KeylessRecoverableErrorEvent({
          error: new Error('SERVER_RECOGNITION_FAILED', { cause: event.detail }),
        }),
      );
    };

    const onRecoverableError = (event: KeylessRecoverableErrorEvent): void => onError(event);

    const onSuccess = (event: KeylessSuccessEvent): void => {
      for (const observer of observers) {
        observer.complete?.(event.detail);
      }

      observers.clear();
    };

    const options: AddEventListenerOptions = { signal: aborter.signal };

    element.addEventListener('error', onError, options);
    element.addEventListener('non-cancelable', () => dispatch({ type: 'non-cancelable' }), options);
    element.addEventListener('recognition-failure', onRecognitionFailure, options);
    element.addEventListener(
      'recognition-start',
      () => dispatch({ type: 'recognition-start' }),
      options,
    );
    element.addEventListener('recoverable-error', onRecoverableError, options);
    element.addEventListener(
      'step-change',
      (e: KeylessStepChangeEvent) => dispatch({ type: 'step-change', detail: e.detail }),
      options,
    );
    element.addEventListener('success', onSuccess, options);
    element.addEventListener(
      'video-frame-quality',
      (e: KeylessVideoFrameQualityEvent) =>
        dispatch({ type: 'video-frame-quality', detail: e.detail }),
      options,
    );
  };

  const client: RecognizeWebComponentClient = {
    subscribe: (observer: RecognizeWebComponentObserver): RecognizeWebComponentUnsubscribe => {
      observers.add(observer);
      return () => observers.delete(observer);
    },

    async init(options: RecognizeWebComponentInitOptions): Promise<RecognizeError | void> {
      if (element !== null) {
        return createRecognizeError(RecognizeErrorCode.SDK_ERROR, {
          cause: 'init() called more than once — call dispose() before re-initializing',
        });
      }

      try {
        await import('./recognize-sdk/index.js');
      } catch (error: unknown) {
        return createRecognizeError(RecognizeErrorCode.SDK_WEB_ASSEMBLY_IMPORT_FAILED, {
          cause: error,
        });
      }

      if (options.mode === 'attach') {
        const tag: string = options.element.tagName;

        if (tag !== 'KL-AUTH' && tag !== 'KL-ENROLL') {
          return createRecognizeError(RecognizeErrorCode.SDK_ERROR, {
            cause: `invalid element <${tag.toLowerCase()}> — options.element must be a <kl-auth> or <kl-enroll> custom element`,
          });
        }

        element = options.element as RecognizeWebComponent;
        element.username = options.username;

        setAttributes(element, config);
        addEventListeners(element);
      } else {
        const tag: 'kl-auth' | 'kl-enroll' = options.type === 'auth' ? 'kl-auth' : 'kl-enroll';

        element = document.createElement(tag);
        element.username = options.username;

        setAttributes(element, config);
        addEventListeners(element);

        options.container.appendChild(element);
      }
    },

    dispose: (): void => {
      if (element === null) return;

      aborter?.abort();
      aborter = null;

      element.remove();
      element = null;

      observers.clear();
    },
  };

  return client;
}
