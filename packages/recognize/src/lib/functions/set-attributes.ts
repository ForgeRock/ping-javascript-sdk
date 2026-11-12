/*
 *
 * Copyright (c) 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import {
  DEFAULT_WASM_BINARY_URL,
  DEFAULT_WASM_DATA_URL,
  DEFAULT_WASM_SCRIPT_URL,
} from '../defs/constants.js';

import type {
  RecognizeWebComponent,
  RecognizeWebComponentConfiguration,
} from '../recognize.types.js';

export function setAttributes(
  element: RecognizeWebComponent,
  config: RecognizeWebComponentConfiguration,
): void {
  if (config.aspectRatio !== undefined) element.aspectRatio = config.aspectRatio;
  if (config.authorizationToken !== undefined)
    element.authorizationToken = config.authorizationToken;
  if (config.cameraAspectRatio !== undefined) element.cameraAspectRatio = config.cameraAspectRatio;
  if (config.cameraInstructions !== undefined)
    element.cameraInstructions = config.cameraInstructions;
  element.customer = config.customer;
  if (config.datadogEnv !== undefined) element.datadogEnv = config.datadogEnv;
  if (config.datadogToken !== undefined) element.datadogToken = config.datadogToken;
  if (config.disableDatadog !== undefined) element.disableDatadog = config.disableDatadog;
  if (config.disableLogger !== undefined) element.disableLogger = config.disableLogger;
  if (config.disablePoweredBy !== undefined) element.disablePoweredBy = config.disablePoweredBy;
  if (config.disableSteps !== undefined) element.disableSteps = config.disableSteps;
  if (config.enableCameraFlash !== undefined) element.enableCameraFlash = config.enableCameraFlash;
  if (config.enableCameraInstructions !== undefined)
    element.enableCameraInstructions = config.enableCameraInstructions;
  if (config.enableCameraInstructionsIcons !== undefined)
    element.enableCameraInstructionsIcons = config.enableCameraInstructionsIcons;
  if (config.enableDatadogPII !== undefined) element.enableDatadogPII = config.enableDatadogPII;
  if (config.enableWasmPthreads !== undefined)
    element.enableWasmPthreads = config.enableWasmPthreads;
  if (config.lang !== undefined) element.lang = config.lang;
  if (config.localizationPacks !== undefined) element.localizationPacks = config.localizationPacks;
  if (config.localizationVariables !== undefined)
    element.localizationVariables = config.localizationVariables;
  if (config.loggerLevel !== undefined) element.loggerLevel = config.loggerLevel;
  if (config.operationID !== undefined) element.operationID = config.operationID;
  if (config.requestRecognitionFrame !== undefined)
    element.requestRecognitionFrame = config.requestRecognitionFrame;
  if (config.seedEntropy !== undefined) element.seedEntropy = config.seedEntropy;
  element.serviceURL = config.serviceURL;
  if (config.theme !== undefined) element.theme = config.theme;
  if (config.themeOptions !== undefined) element.themeOptions = config.themeOptions;
  if (config.transactionData !== undefined) element.transactionData = config.transactionData;
  element.wasmBinaryURL = config.wasmBinaryURL ?? DEFAULT_WASM_BINARY_URL;
  element.wasmDataURL = config.wasmDataURL ?? DEFAULT_WASM_DATA_URL;
  element.wasmScriptURL = config.wasmScriptURL ?? DEFAULT_WASM_SCRIPT_URL;
}
