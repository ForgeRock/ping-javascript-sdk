/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { RecognizeError } from '../classes/recognize-error.js';
import { RecognizeErrorCode } from '../defs/recognize-error-code.js';
import { RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP } from '../defs/recognize-sdk-to-recognize-proxy-error-map.js';

/** @public */
export const createRecognizeError = (
  codeOrSdkError: RecognizeErrorCode | ErrorEvent,
  cause?: Error,
): RecognizeError => {
  if (codeOrSdkError instanceof ErrorEvent) {
    if (codeOrSdkError.error instanceof Error) {
      let code: RecognizeErrorCode;

      code =
        RECOGNIZE_SDK_TO_RECOGNIZE_PROXY_ERROR_MAP[codeOrSdkError.error.message] ||
        RecognizeErrorCode.SDK_ERROR;

      return new RecognizeError(code, codeOrSdkError.error);
    }
  } else {
    return new RecognizeError(codeOrSdkError, cause);
  }

  return new RecognizeError(RecognizeErrorCode.SDK_ERROR, cause);
};
