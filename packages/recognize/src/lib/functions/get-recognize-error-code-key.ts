/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { RECOGNIZE_ERROR_CODE } from '../defs/recognize-error-code.js';
import type { RecognizeErrorCodeKey, RecognizeErrorCodeValue } from '../recognize.types.js';

/** @public */
export function getRecognizeErrorCodeKey(code: RecognizeErrorCodeValue): RecognizeErrorCodeKey {
  let keys: RecognizeErrorCodeKey[], key: RecognizeErrorCodeKey | undefined;

  keys = Object.keys(RECOGNIZE_ERROR_CODE) as RecognizeErrorCodeKey[];
  key = keys.find((key: RecognizeErrorCodeKey) => RECOGNIZE_ERROR_CODE[key] === code);

  return key ?? 'SDK_ERROR';
}
