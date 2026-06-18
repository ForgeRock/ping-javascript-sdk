import { RecognizeErrorCode } from '../defs/recognize-error-code.js';

/** @public */
export class RecognizeError extends Error {
  code: RecognizeErrorCode;

  constructor(code: RecognizeErrorCode, options?: ErrorOptions) {
    super(RecognizeErrorCode[code], options);

    this.code = code;
    this.name = 'RecognizeError';
  }
}
