/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { causeIsDie, exitIsFail, exitIsSuccess } from 'effect/Micro';

import type { GenericError } from '@forgerock/sdk-types';
import type { MicroExit } from 'effect/Micro';

export function handleMicroExit<T, E>(
  result: MicroExit<T, E>,
  defectError: string,
  defectType: GenericError['type'],
): T | E | GenericError {
  if (exitIsSuccess(result)) {
    return result.value;
  }
  if (exitIsFail(result)) {
    return result.cause.error;
  }
  const defect = causeIsDie(result.cause) ? result.cause.defect : undefined;
  return {
    error: defectError,
    message: defect instanceof Error ? defect.message : String(defect ?? 'Unknown defect'),
    type: defectType,
  };
}
