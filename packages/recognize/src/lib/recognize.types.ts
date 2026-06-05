/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type {
  KeylessFinishedEventDetail,
  KeylessFrameResultsEventDetail,
  KeylessStepChangeEventDetail,
  KeylessVideoFrameQualityEventDetail,
  KeylessWebSocketCloseEventDetail,
  KeylessWebSocketOpenEventDetail,
} from './recognize-sdk/index.js';
import type { RecognizeError, RecognizeErrorCode } from './errors.js';

export type { RecognizeError, RecognizeErrorCode };

/** @public */
export type RecognizeSessionType = 'auth' | 'enroll';

/** @public */
export interface RecognizeWcFinishedEventDetail extends KeylessFinishedEventDetail {}

/** @public */
export type RecognizeWcEvent =
  | { type: 'step-change'; detail: KeylessStepChangeEventDetail }
  | { type: 'finished'; detail: RecognizeWcFinishedEventDetail }
  | { type: 'error'; detail: RecognizeError }
  | { type: 'frame-results'; detail: KeylessFrameResultsEventDetail }
  | { type: 'video-frame-quality'; detail: KeylessVideoFrameQualityEventDetail }
  | { type: 'ws-open'; detail: KeylessWebSocketOpenEventDetail }
  | { type: 'ws-close'; detail: KeylessWebSocketCloseEventDetail };

/** @public */
export type RecognizeWcCompleteDetail = RecognizeWcFinishedEventDetail;

/** @public */
export interface RecognizeWcObserver {
  next: (event: RecognizeWcEvent) => void;
  error?: (err: RecognizeError) => void;
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
