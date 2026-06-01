/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { StepType } from '@forgerock/sdk-types';

import type { GenericError, Step } from '@forgerock/sdk-types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import { createJourneyLoginSuccess } from './login-success.utils.js';
import { createJourneyLoginFailure } from './login-failure.utils.js';
import { createJourneyStep } from './step.utils.js';

import type { JourneyStep } from './step.utils.js';
import type { JourneyLoginFailure } from './login-failure.utils.js';
import type { JourneyLoginSuccess } from './login-success.utils.js';

/**
 * Creates a journey object from a raw Step response.
 * Determines the step type based on the presence of authId or successUrl properties
 * and returns the appropriate journey object type.
 *
 * @param step - The raw Step response from the authentication API
 * @returns A JourneyStep, JourneyLoginSuccess, JourneyLoginFailure, or GenericError if the step type cannot be determined
 */
export function createJourneyObject(
  step: Step,
): JourneyStep | JourneyLoginSuccess | JourneyLoginFailure | GenericError {
  let type;
  if (step.authId) {
    type = StepType.Step;
  } else if (step.successUrl) {
    type = StepType.LoginSuccess;
  } else {
    type = StepType.LoginFailure;
  }

  switch (type) {
    case StepType.LoginSuccess:
      return createJourneyLoginSuccess(step);
    case StepType.LoginFailure:
      return createJourneyLoginFailure(step);
    case StepType.Step:
      return createJourneyStep(step);
    default:
      return {
        error: 'unknown_step_type',
        message: 'Unable to determine step type from server response',
        type: 'unknown_error',
      };
  }
}

/**
 * Resolves an RTK Query response to a Step or GenericError.
 *
 * @param data - The Step data returned by the RTK Query endpoint, if any
 * @param error - The error returned by the RTK Query endpoint, if any
 * @returns Step on success, GenericError on failure
 */
export function handleJourneyResponse(
  data: Step | undefined,
  error: FetchBaseQueryError | SerializedError | undefined,
): Step | GenericError {
  /**
   * https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery#signature
   * FetchBaseQueryError with status: number means AM returned an HTTP response with a JSON body.
   * Only this variant can carry an AM failure payload — FETCH_ERROR, PARSING_ERROR, TIMEOUT_ERROR,
   * and CUSTOM_ERROR either have no body or a non-object body (raw string for PARSING_ERROR).
   */
  if (
    error &&
    'status' in error &&
    typeof error.status === 'number' &&
    typeof error.data === 'object' &&
    error.data !== null
  ) {
    return error.data as Step;
  }

  /**
   * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#type-safe-error-handling
   * All other FetchBaseQueryError variants expose an `error` string; SerializedError exposes `message`.
   * Both represent infrastructure failures with no usable AM response body.
   */
  if (error) {
    const msg = 'error' in error ? error.error : 'message' in error ? error.message : undefined;
    return {
      error: 'request_failed',
      message: `Request failed: ${msg ?? 'Unknown error'}`,
      type: 'unknown_error',
    };
  }

  if (!data) {
    return {
      error: 'no_response_data',
      message: 'No data received from server',
      type: 'unknown_error',
    };
  }

  return data;
}
