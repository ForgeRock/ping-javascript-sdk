/*
 * Copyright (c) 2025-2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { StepType } from '@forgerock/sdk-types';

import type { GenericError, Step } from '@forgerock/sdk-types';

import { createJourneyLoginSuccess } from './login-success.utils.js';
import { createJourneyLoginFailure } from './login-failure.utils.js';
import { createJourneyStep } from './step.utils.js';

import type { JourneyStep } from './step.utils.js';
import type { JourneyLoginFailure } from './login-failure.utils.js';
import type { JourneyLoginSuccess } from './login-success.utils.js';

const STEP_LIKE_KEYS = [
  'authId',
  'callbacks',
  'code',
  'description',
  'detail',
  'header',
  'ok',
  'realm',
  'reason',
  'stage',
  'status',
  'successUrl',
  'tokenId',
] as const;

/**
 * Creates a journey object from a raw Step response.
 * Determines the step type based on the presence of authId or successUrl properties
 * and returns the appropriate journey object type.
 *
 * @param step - The raw Step response from the authentication API (or undefined if the request failed)
 * @param error - Optional error result (e.g., RTK Query error) that may contain a Step-shaped payload in `error.data`
 * @returns A JourneyStep, JourneyLoginSuccess, JourneyLoginFailure, or GenericError if the step type cannot be determined
 */
function createJourneyObject(
  step: Step | undefined,
  error?: unknown,
): JourneyStep | JourneyLoginSuccess | JourneyLoginFailure | GenericError {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const resolved = resolveStep(step, error);
  if ('error' in resolved) return resolved;

  const resolvedStep = resolved;

  let type;
  if (resolvedStep.authId) {
    type = StepType.Step;
  } else if (resolvedStep.successUrl) {
    type = StepType.LoginSuccess;
  } else {
    type = StepType.LoginFailure;
  }

  switch (type) {
    case StepType.LoginSuccess:
      return createJourneyLoginSuccess(resolvedStep);
    case StepType.LoginFailure:
      return createJourneyLoginFailure(resolvedStep);
    case StepType.Step:
      return createJourneyStep(resolvedStep);
    default:
      return {
        error: 'unknown_step_type',
        message: 'Unable to determine step type from server response',
        type: 'unknown_error',
      };
  }
}

function resolveStep(step: Step | undefined, error?: unknown): Step | GenericError {
  if (step) return step;

  const errorObj =
    error && typeof error === 'object'
      ? (error as { data?: unknown; status?: unknown })
      : undefined;

  const data = errorObj?.data;
  if (data && typeof data === 'object' && STEP_LIKE_KEYS.some((key) => key in data)) {
    return data as Step;
  }

  if (errorObj) {
    const status = errorObj.status;
    return {
      error: 'request_failed',
      message: status !== undefined ? `Request failed: ${status}` : 'Request failed',
      type: 'unknown_error',
    };
  }

  return {
    error: 'no_response_data',
    message: 'No data received from server',
    type: 'unknown_error',
  };
}

export { createJourneyObject };
