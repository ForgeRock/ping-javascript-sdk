/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { StepType } from '@forgerock/sdk-types';

import type { Step } from '@forgerock/sdk-types';

import { createJourneyLoginSuccess, JourneyLoginSuccess } from './journey-login-success.utils.js';
import { createJourneyLoginFailure, JourneyLoginFailure } from './journey-login-failure.utils.js';
import { createJourneyStep, JourneyStep } from './journey-step.utils.js';

function createJourneyObject(
  step: Step,
): JourneyStep | JourneyLoginSuccess | JourneyLoginFailure | undefined {
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
      return undefined;
  }
}

export { createJourneyObject };
