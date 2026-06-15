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

export type { RecognizeError };

/** @public */
export type RecognizeRootElement = KeylessAuthElement | KeylessEnrollElement;

/** @public */
export type RecognizeSessionType = 'auth' | 'enroll';

/** @public */
export type RecognizeWcStepChangeEventDetail = KeylessStepChangeEventDetail;

/** @public */
export type RecognizeWcFrameResultsEventDetail = KeylessFrameResultsEventDetail;

/** @public */
export type RecognizeWcVideoFrameQualityEventDetail = KeylessVideoFrameQualityEventDetail;

/** @public */
export type RecognizeWcWebSocketOpenEventDetail = KeylessWebSocketOpenEventDetail;

/** @public */
export type RecognizeWcWebSocketCloseEventDetail = KeylessWebSocketCloseEventDetail;

/** @public */
export type RecognizeWcEvent =
  | { type: 'step-change'; detail: RecognizeWcStepChangeEventDetail }
  | { type: 'error'; detail: RecognizeError }
  | { type: 'frame-results'; detail: RecognizeWcFrameResultsEventDetail }
  | { type: 'video-frame-quality'; detail: RecognizeWcVideoFrameQualityEventDetail }
  | { type: 'ws-open'; detail: RecognizeWcWebSocketOpenEventDetail }
  | { type: 'ws-close'; detail: RecognizeWcWebSocketCloseEventDetail };

/** @public */
export type RecognizeWcCompleteDetail = KeylessFinishedEventDetail;

/** @public */
export interface RecognizeWcObserver {
  next: (event: RecognizeWcEvent) => void;
  error?: (error: RecognizeError) => void;
  complete?: (detail: RecognizeWcCompleteDetail) => void;
}

/** @public */
export type RecognizeWcUnsubscribe = () => void;

/** @public */
export type RecognizeWcInitOptions =
  | { mode: 'mount'; container: HTMLElement; type: RecognizeSessionType; username: string }
  | { mode: 'attach'; element: HTMLElement; username: string };

/** @public */
export interface RecognizeWcClient {
  subscribe: (observer: RecognizeWcObserver) => RecognizeWcUnsubscribe;
  init(options: RecognizeWcInitOptions): Promise<void | RecognizeError>;
  dispose: () => void;
}

/** @public */
export interface RecognizeWcConfig {
  customer: string;
  key: string;
  keyID: string;
  wsURL: string;
  authorizationToken?: string;
  disableSteps?: string[];
  datadogEnv?: string;
  datadogToken?: string;
  disableDatadog?: boolean;
  disableLogger?: boolean;
  disablePoweredBy?: boolean;
  enableCameraFlash?: boolean;
  enableCameraInstructions?: boolean;
  enableCameraInstructionsIcons?: boolean;
  enableWasmPthreads?: boolean;
  lang?: string;
  localizationPacks?: unknown[];
  localizationVariables?: unknown;
  loggerLevel?: string;
  operationID?: string;
  seedEntropy?: boolean;
  transactionData?: string;
  theme?: unknown;
  themeOptions?: unknown;
  wasmBinaryURL?: string;
  wasmDataURL?: string;
  wasmScriptURL?: string;
  wsTimeout?: number;
}
