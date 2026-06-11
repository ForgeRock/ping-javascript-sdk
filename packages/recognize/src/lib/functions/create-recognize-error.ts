/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { RecognizeErrorCode } from '../defs/recognize-error-code.js';
import { RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP } from '../defs/recognize-sdk-to-recognize-proxy-error-map.js';
import type { RecognizeError } from '../recognize.types.js';

/** @public */
export const createRecognizeError = (
  codeOrSdkError: RecognizeErrorCode | ErrorEvent,
  cause?: unknown,
): RecognizeError => {
  let code: RecognizeErrorCode;
  let errorCause: unknown;

  if (codeOrSdkError instanceof ErrorEvent) {
    const reason = (codeOrSdkError as ErrorEvent & { reason?: string }).reason;
    code =
      (reason && RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP[reason]) ||
      RecognizeErrorCode.SDK_ERROR;
    errorCause = codeOrSdkError.error;
  } else {
    code = codeOrSdkError;
    errorCause = cause;
  }

  const error = new Error(code) as RecognizeError;
  error.name = 'RecognizeError';
  error.code = code;
  if (errorCause !== undefined) error.cause = errorCause;
  return error;
};
