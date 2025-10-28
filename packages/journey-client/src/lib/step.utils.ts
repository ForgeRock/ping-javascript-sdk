/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { type CallbackType, type Callback, type Step } from '@forgerock/sdk-types';

import { StepType } from '@forgerock/sdk-types';

import { createCallback } from './callbacks/factory.js';

import type { BaseCallback } from './callbacks/base-callback.js';
import type { JourneyStep } from './step.types.js';
import type { CallbackFactory } from './callbacks/factory.js';

function getCallbacksOfType<T extends BaseCallback>(
  callbacks: BaseCallback[],
  type: CallbackType,
): T[] {
  return callbacks.filter((x) => x.getType() === type) as T[];
}

function getCallbackOfType<T extends BaseCallback>(
  callbacks: BaseCallback[],
  type: CallbackType,
): T {
  const callbacksOfType = getCallbacksOfType<T>(callbacks, type);
  if (callbacksOfType.length !== 1) {
    throw new Error(`Expected 1 callback of type "${type}", but found ${callbacksOfType.length}`);
  }
  return callbacksOfType[0];
}

function setCallbackValue(callbacks: BaseCallback[], type: CallbackType, value: unknown): void {
  const callbacksToUpdate = getCallbacksOfType(callbacks, type);
  if (callbacksToUpdate.length !== 1) {
    throw new Error(`Expected 1 callback of type "${type}", but found ${callbacksToUpdate.length}`);
  }
  callbacksToUpdate[0].setInputValue(value);
}

function getDescription(payload: Step): string | undefined {
  return payload.description;
}

function getHeader(payload: Step): string | undefined {
  return payload.header;
}

function getStage(payload: Step): string | undefined {
  return payload.stage;
}

function convertCallbacks(
  callbacks: Callback[],
  callbackFactory?: CallbackFactory,
): BaseCallback[] {
  const converted = callbacks.map((x: Callback) => {
    // This gives preference to the provided factory and falls back to our default implementation
    return (callbackFactory || createCallback)(x) || createCallback(x);
  });
  return converted;
}

function createJourneyStep(payload: Step, callbackFactory?: CallbackFactory): JourneyStep {
  // Redux Toolkit freezes data, so we need to clone it before making any changes
  const unfrozenPayload =
    typeof structuredClone === 'function'
      ? structuredClone(payload)
      : (JSON.parse(JSON.stringify(payload)) as Step);

  const convertedCallbacks = unfrozenPayload.callbacks
    ? convertCallbacks(unfrozenPayload.callbacks, callbackFactory)
    : [];
  return {
    payload: unfrozenPayload,
    callbacks: convertedCallbacks,
    type: StepType.Step,
    getCallbackOfType: <T extends BaseCallback>(type: CallbackType) =>
      getCallbackOfType<T>(convertedCallbacks, type),
    getCallbacksOfType: <T extends BaseCallback>(type: CallbackType) =>
      getCallbacksOfType<T>(convertedCallbacks, type),
    setCallbackValue: (type: CallbackType, value: unknown) =>
      setCallbackValue(convertedCallbacks, type, value),
    getDescription: () => getDescription(payload),
    getHeader: () => getHeader(payload),
    getStage: () => getStage(payload),
  };
}

/**
 * A function that can populate the provided authentication tree step.
 */

type JourneyStepHandler = (step: JourneyStep) => void;

export { createJourneyStep, JourneyStep, JourneyStepHandler };
