/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
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

/**
 * Creates a journey object from a raw Step response.
 * Determines the step type based on the presence of authId or successUrl properties
 * and returns the appropriate journey object type.
 *
 * @param step - The raw Step response from the authentication API
 * @returns A JourneyStep, JourneyLoginSuccess, JourneyLoginFailure, or GenericError if the step type cannot be determined
 */
function createJourneyObject(
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

export { createJourneyObject };
