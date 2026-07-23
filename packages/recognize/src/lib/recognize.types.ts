/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { RecognizeError } from './functions/recognize-error.js';
import type {
  KeylessAuthElement,
  KeylessCameraInstruction,
  KeylessEnrollElement,
  KeylessStepChangeEventDetail,
  KeylessSuccessEventDetail,
  KeylessVideoFrameQualityEventDetail,
} from './recognize-sdk/index.js';

declare global {
  interface HTMLElementTagNameMap {
    'kl-auth': KeylessAuthElement;
    'kl-enroll': KeylessEnrollElement;
  }
}

/** @public */
export type RecognizeSessionType = 'auth' | 'enroll';

/**
 * Events
 */
/** */
/** @public */
export type RecognizeWebComponentStepChangeEventDetail = KeylessStepChangeEventDetail;

/** @public */
export type RecognizeWebComponentVideoFrameQualityEventDetail = KeylessVideoFrameQualityEventDetail;

/**
 * Web Components Client
 */
/** */

/** @public */
export interface RecognizeWebComponentClient {
  subscribe: (observer: RecognizeWebComponentObserver) => RecognizeWebComponentUnsubscribe;
  init(options: RecognizeWebComponentInitOptions): Promise<RecognizeError | void>;
  dispose: () => void;
}

/** @public */
export type RecognizeWebComponentCompleteData = KeylessSuccessEventDetail;

/** @public */
export interface RecognizeWebComponentConfiguration {
  aspectRatio?: string;
  authorizationToken?: string;
  cameraAspectRatio?: string;
  cameraInstructions?: KeylessCameraInstruction[];
  customer: string;
  datadogEnv?: string;
  datadogToken?: string;
  disableDatadog?: boolean;
  disableLogger?: boolean;
  disablePoweredBy?: boolean;
  disableSteps?: string[];
  enableCameraFlash?: boolean;
  enableCameraInstructions?: boolean;
  enableCameraInstructionsIcons?: boolean;
  enableDatadogPII?: boolean;
  enableWasmPthreads?: boolean;
  lang?: string;
  localizationPacks?: unknown[];
  localizationVariables?: unknown;
  loggerLevel?: string;
  operationID?: string;
  seedEntropy?: boolean;
  serviceURL: string;
  theme?: unknown;
  themeOptions?: unknown;
  transactionData?: string;
  wasmBinaryURL?: string;
  wasmDataURL?: string;
  wasmScriptURL?: string;
}

/** @public */
export type RecognizeWebComponent = KeylessAuthElement | KeylessEnrollElement;

/** @public */
export type RecognizeWebComponentEvent =
  | { type: 'non-cancelable' }
  | { type: 'recognition-start' }
  | { type: 'step-change'; detail: RecognizeWebComponentStepChangeEventDetail }
  | { type: 'video-frame-quality'; detail: RecognizeWebComponentVideoFrameQualityEventDetail };

/** @public */
export type RecognizeWebComponentInitOptions =
  | { mode: 'mount'; container: HTMLElement; type: RecognizeSessionType; username: string }
  | { mode: 'attach'; element: HTMLElement; username: string };

/** @public */
export interface RecognizeWebComponentObserver {
  next: (event: RecognizeWebComponentEvent) => void;
  error?: (error: RecognizeError) => void;
  complete?: (data: RecognizeWebComponentCompleteData) => void;
}

/** @public */
export type RecognizeWebComponentUnsubscribe = () => void;
