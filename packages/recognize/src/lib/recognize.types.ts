/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { RecognizeError } from './classes/recognize-error.js';
import type {
  KeylessAuthElement,
  KeylessEnrollElement,
  KeylessFinishedEventDetail,
  KeylessFrameResultsEventDetail,
  KeylessStepChangeEventDetail,
  KeylessVideoFrameQualityEventDetail,
  KeylessWebSocketCloseEventDetail,
  KeylessWebSocketOpenEventDetail,
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
export type RecognizeWebComponentFrameResultsEventDetail = KeylessFrameResultsEventDetail;

/** @public */
export type RecognizeWebComponentStepChangeEventDetail = KeylessStepChangeEventDetail;

/** @public */
export type RecognizeWebComponentVideoFrameQualityEventDetail = KeylessVideoFrameQualityEventDetail;

/** @public */
export type RecognizeWebComponentWebSocketCloseEventDetail = KeylessWebSocketCloseEventDetail;

/** @public */
export type RecognizeWebComponentWebSocketOpenEventDetail = KeylessWebSocketOpenEventDetail;

/**
 * Web Components Client
 */
/** */

/** @public */
export interface RecognizeWebComponentClient {
  subscribe: (observer: RecognizeWebComponentObserver) => RecognizeWebComponentUnsubscribe;
  init(options: RecognizeWebComponentInitOptions): Promise<void | RecognizeError>;
  dispose: () => void;
}

/** @public */
export type RecognizeWebComponentCompleteData = KeylessFinishedEventDetail;

/** @public */
export interface RecognizeWebComponentConfiguration {
  authorizationToken?: string;
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
  enableWasmPthreads?: boolean;
  key: string;
  keyID: string;
  lang?: string;
  localizationPacks?: unknown[];
  localizationVariables?: unknown;
  loggerLevel?: string;
  operationID?: string;
  seedEntropy?: boolean;
  theme?: unknown;
  themeOptions?: unknown;
  transactionData?: string;
  wasmBinaryURL?: string;
  wasmDataURL?: string;
  wasmScriptURL?: string;
  wsTimeout?: number;
  wsURL: string;
}

/** @public */
export type RecognizeWebComponent = KeylessAuthElement | KeylessEnrollElement;

/** @public */
export type RecognizeWebComponentEvent =
  | { type: 'begin-stream'; detail: void }
  | { type: 'frame-results'; detail: RecognizeWebComponentFrameResultsEventDetail }
  | { type: 'step-change'; detail: RecognizeWebComponentStepChangeEventDetail }
  | { type: 'stop-stream'; detail: void }
  | { type: 'video-frame-quality'; detail: RecognizeWebComponentVideoFrameQualityEventDetail }
  | { type: 'ws-close'; detail: RecognizeWebComponentWebSocketCloseEventDetail }
  | { type: 'ws-open'; detail: RecognizeWebComponentWebSocketOpenEventDetail };

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
