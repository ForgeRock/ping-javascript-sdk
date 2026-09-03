/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Cause, Exit } from 'effect';
import type { GenericError } from '@forgerock/sdk-types';

/**
 * Unwrap an {@link Exit.Exit} into a plain value.
 *
 * - **Success** → returns the wrapped value.
 * - **Failure with a typed error** → returns the error value from the first `Fail` reason.
 * - **Defect / Die** → returns a {@link GenericError} built from the defect message.
 * - **Other failure** → returns a {@link GenericError} with an unknown defect message.
 */
export function handleExit<T, E>(
  result: Exit.Exit<T, E>,
  defectError: string,
  defectType: GenericError['type'],
): T | E | GenericError {
  if (Exit.isSuccess(result)) {
    return result.value;
  }
  const reasons = result.cause.reasons;
  const failReason = reasons.find(Cause.isFailReason);
  if (failReason !== undefined) {
    return failReason.error;
  }
  const dieReason = reasons.find(Cause.isDieReason);
  const defect = dieReason?.defect;
  return {
    error: defectError,
    message: defect instanceof Error ? defect.message : String(defect ?? 'Unknown defect'),
    type: defectType,
  };
}
