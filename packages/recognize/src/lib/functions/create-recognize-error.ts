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
  cause?: Error,
): RecognizeError => {
  let code: RecognizeErrorCode;
  let errorCause: Error | undefined;

  if (codeOrSdkError instanceof ErrorEvent) {
    const reason = (codeOrSdkError as ErrorEvent & { reason?: string }).reason;
    code =
      (reason && RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP[reason]) ||
      RecognizeErrorCode.SDK_ERROR;
    errorCause = codeOrSdkError.error instanceof Error ? codeOrSdkError.error : undefined;
  } else {
    code = codeOrSdkError;
    errorCause = cause;
  }

  const error: RecognizeError = Object.assign(new Error(code), {
    name: 'RecognizeError',
    code,
    cause: errorCause,
  });
  return error;
};
