/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { LocalizationPack, LocalizationVariables, LoggerLevel, Theme } from '@aracna/core';

import type { RECOGNIZE_ERROR_CODE } from './defs/recognize-error-code.js';
import type {
  KeylessAuthElement,
  KeylessCameraInstruction,
  KeylessComponentsStep,
  KeylessEnrollElement,
  KeylessStepChangeEventDetail,
  KeylessSuccessEventDetail,
  KeylessThemeOptions,
  KeylessVideoFrameQualityEventDetail,
} from './recognize-sdk/index.js';

declare global {
  interface HTMLElementTagNameMap {
    'kl-auth': KeylessAuthElement;
    'kl-enroll': KeylessEnrollElement;
  }
}

/** @public */
export interface CreateRecognizeErrorOptions {
  cause?: unknown;
}

/** @public */
export interface RecognizeError {
  error: {
    cause?: unknown;
    code: RecognizeErrorCodeValue;
    message: RecognizeErrorCodeKey;
  };
}

/** @public */
export type RecognizeErrorCodeKey = keyof typeof RECOGNIZE_ERROR_CODE;

/** @public */
export type RecognizeErrorCodeValue = (typeof RECOGNIZE_ERROR_CODE)[RecognizeErrorCodeKey];

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
  aspectRatio?: number | string;
  authorizationToken?: string;
  cameraAspectRatio?: number | string;
  cameraInstructions?: KeylessCameraInstruction[];
  customer: string;
  datadogEnv?: string;
  datadogToken?: string;
  disableDatadog?: boolean;
  disableLogger?: boolean;
  disablePoweredBy?: boolean;
  disableSteps?: KeylessComponentsStep[];
  enableCameraFlash?: boolean;
  enableCameraInstructions?: boolean;
  enableCameraInstructionsIcons?: boolean;
  enableDatadogPII?: boolean;
  enableWasmPthreads?: boolean;
  lang?: string;
  localizationPacks?: LocalizationPack[];
  localizationVariables?: LocalizationVariables;
  loggerLevel?: LoggerLevel;
  operationID?: string;
  seedEntropy?: boolean;
  serviceURL: string;
  theme?: Theme;
  themeOptions?: KeylessThemeOptions;
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
