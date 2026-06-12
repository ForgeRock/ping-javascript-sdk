import type { RecognizeErrorCode } from '../defs/recognize-error-code.js';

/** @public */
export class RecognizeError extends Error {
  code: RecognizeErrorCode;

  constructor(code: RecognizeErrorCode, cause?: Error) {
    super(code);

    this.code = code;
    this.cause = cause;
    this.name = 'RecognizeError';
  }
}
