/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenericError } from '@forgerock/sdk-types';

/**
 * WebAuthn error codes that can occur during FIDO operations.
 * These align with standard DOMException names from the WebAuthn specification.
 * Used in the `code` field of GenericError when a FIDO operation fails.
 */
export type FidoErrorCode =
  | 'NotAllowedError'
  | 'AbortError'
  | 'InvalidStateError'
  | 'NotSupportedError'
  | 'SecurityError'
  | 'TimeoutError'
  | 'UnknownError';

const VALID_FIDO_ERROR_CODES: ReadonlySet<FidoErrorCode> = new Set([
  'NotAllowedError',
  'AbortError',
  'InvalidStateError',
  'NotSupportedError',
  'SecurityError',
  'TimeoutError',
]);

function isErrorWithName(error: unknown): error is { name: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name: unknown }).name === 'string'
  );
}

function isFidoErrorCode(name: string): name is FidoErrorCode {
  return VALID_FIDO_ERROR_CODES.has(name as FidoErrorCode);
}

/**
 * Maps an error to a FidoErrorCode.
 * @param error - The error from WebAuthn API
 * @returns The corresponding FidoErrorCode
 */
export function toFidoErrorCode(error: unknown): FidoErrorCode {
  if (isErrorWithName(error) && isFidoErrorCode(error.name)) {
    return error.name;
  }
  return 'UnknownError';
}

/**
 * Creates a GenericError for FIDO operations with proper typing.
 * @param code - The WebAuthn error code
 * @param errorType - The error category (e.g., 'registration_error', 'authentication_error')
 * @param message - Human-readable error message
 * @returns A properly typed GenericError
 */
export function createFidoError(
  code: FidoErrorCode,
  errorType: string,
  message: string,
): GenericError {
  return {
    code,
    error: errorType,
    message,
    type: 'fido_error',
  };
}
