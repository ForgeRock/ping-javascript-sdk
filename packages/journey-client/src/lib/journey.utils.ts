/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { StepType } from '@forgerock/sdk-types';
import * as Either from 'effect/Either';

import { createJourneyLoginFailure } from './login-failure.utils.js';
import { createJourneyLoginSuccess } from './login-success.utils.js';
import { createJourneyStep } from './step.utils.js';

import type { GenericError, Step } from '@forgerock/sdk-types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { JourneyLoginFailure } from './login-failure.utils.js';
import type { JourneyLoginSuccess } from './login-success.utils.js';
import type { JourneyStep } from './step.utils.js';

export type JourneyResult = JourneyStep | JourneyLoginSuccess | JourneyLoginFailure | GenericError;

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
 * Parses a resolved RTK Query journey response into Either<Step, GenericError>.
 *
 * Right = a valid AM step payload (including LoginFailure — AM sends those as structured steps
 *         over HTTP 4xx, so they are application logic, not transport failures).
 * Left  = the transport broke and there is nothing for the journey state machine to consume.
 *
 * Rule out every transport failure first; whatever survives must be a valid step.
 */
export function parseJourneyResponse(res: {
  data?: Step;
  error?: FetchBaseQueryError | SerializedError;
}): Either.Either<Step, GenericError> {
  // https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery#signature
  // AM sends LoginFailure as a structured step body over HTTP 4xx — normalise both sources so the
  // left guards below only see genuine transport failures, never AM application responses.
  const stepData: Step | undefined =
    res.data ??
    (res.error &&
    'status' in res.error &&
    typeof res.error.status === 'number' &&
    typeof res.error.data === 'object' &&
    res.error.data !== null
      ? (res.error.data as Step)
      : undefined);

  // https://redux-toolkit.js.org/rtk-query/usage-with-typescript#type-safe-error-handling
  // Non-HTTP fetch failure (network down, CORS, etc.) — definitely left, never carries an AM body
  if (res.error && 'error' in res.error) {
    return Either.left({
      error: 'request_failed',
      message: `Request failed: ${res.error.error}`,
      type: 'unknown_error',
    });
  }

  // Redux serialization error — definitely left, never carries an AM body
  if (res.error && 'message' in res.error) {
    return Either.left({
      error: 'request_failed',
      message: `Request failed: ${res.error.message ?? 'Unknown error'}`,
      type: 'unknown_error',
    });
  }

  // HTTP error whose body was not a parseable AM step — left
  if (res.error && !stepData) {
    return Either.left({
      error: 'request_failed',
      message: 'Request failed: Unknown error',
      type: 'unknown_error',
    });
  }

  // No data from either source — left
  if (!stepData) {
    return Either.left({
      error: 'no_response_data',
      message: 'No data received from server',
      type: 'unknown_error',
    });
  }

  // Every transport failure has been ruled out — this is a valid AM step
  return Either.right(stepData);
}
