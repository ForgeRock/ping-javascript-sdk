/*
 *
 * Copyright (c) 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { getRecognizeErrorCodeKey } from './get-recognize-error-code-key.js';

import type {
  CreateRecognizeErrorOptions,
  RecognizeError,
  RecognizeErrorCodeValue,
  RecognizeErrorRaw,
} from '../recognize.types.js';

/**
 * Converts a `cause` of any shape into a wire-safe snapshot. Live `Error`
 * instances are flattened into an enumerable object that mimics the `Error`
 * interface — non-enumerable properties like `message`, `stack`, and `cause`
 * would otherwise serialize to `{}` in `JSON.stringify`, silently dropping
 * the diagnostic detail. Values that are already JSON-safe (strings, plain
 * objects) are stringified into the `cause` field to keep `raw` uniform.
 * @param {unknown} cause - The raw cause carried by the triggering error
 * @returns {RecognizeErrorRaw} The wire-safe error snapshot
 */
function toRecognizeErrorRaw(cause: unknown): RecognizeErrorRaw {
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      stack: cause.stack,
      cause:
        cause.cause !== undefined
          ? typeof cause.cause === 'string'
            ? cause.cause
            : JSON.stringify(cause.cause)
          : undefined,
    };
  }

  return {
    name: 'UnknownError',
    message: typeof cause === 'string' ? cause : 'Unknown error',
    cause: cause === undefined ? undefined : JSON.stringify(cause),
  };
}

/** @public */
export function createRecognizeError(
  code: RecognizeErrorCodeValue,
  options?: CreateRecognizeErrorOptions,
): RecognizeError {
  const raw = options?.cause !== undefined ? toRecognizeErrorRaw(options.cause) : undefined;

  return {
    error: {
      cause: options?.cause,
      code,
      message: getRecognizeErrorCodeKey(code),
      ...(raw && { raw }),
    },
  };
}
