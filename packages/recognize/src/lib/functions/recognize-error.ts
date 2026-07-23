import { RecognizeErrorCode } from '../defs/recognize-error-code.js';

/** @public */
export interface RecognizeError {
  name: 'RecognizeError';
  code: RecognizeErrorCode;
  message: string;
  cause?: unknown;
}

export function createInternalError(
  code: RecognizeErrorCode,
  options?: ErrorOptions,
): RecognizeError {
  const message =
    (Object.keys(RecognizeErrorCode) as Array<keyof typeof RecognizeErrorCode>).find(
      (k) => RecognizeErrorCode[k] === code,
    ) ?? String(code);

  return {
    name: 'RecognizeError',
    code,
    message,
    cause: options?.cause,
  };
}
