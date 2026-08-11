/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type {
  CreateRecognizeErrorOptions,
  RecognizeError,
  RecognizeErrorCodeValue,
} from '../recognize.types.js';
import { getRecognizeErrorCodeKey } from './get-recognize-error-code-key.js';

/** @public */
export function createRecognizeError(
  code: RecognizeErrorCodeValue,
  options?: CreateRecognizeErrorOptions,
): RecognizeError {
  return {
    error: {
      cause: options?.cause,
      code,
      message: getRecognizeErrorCodeKey(code),
    },
  };
}
