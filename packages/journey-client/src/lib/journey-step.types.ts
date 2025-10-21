/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { AuthResponse, CallbackType, Step, StepType } from '@forgerock/sdk-types';

import type { JourneyCallback } from './callbacks/index.js';

export type JourneyStep = AuthResponse & {
  type: StepType.Step;
  payload: Step;
  callbacks: JourneyCallback[];
  getCallbackOfType: <T extends JourneyCallback>(type: CallbackType) => T;
  getCallbacksOfType: <T extends JourneyCallback>(type: CallbackType) => T[];
  setCallbackValue: (type: CallbackType, value: unknown) => void;
  getDescription: () => string | undefined;
  getHeader: () => string | undefined;
  getStage: () => string | undefined;
};
