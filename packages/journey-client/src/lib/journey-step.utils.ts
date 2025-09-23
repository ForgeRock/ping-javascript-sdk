/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import {
  type CallbackType,
  type Callback,
  type Step,
  type AuthResponse,
} from '@forgerock/sdk-types';
import type JourneyCallback from './callbacks/index.js';
import type { JourneyCallbackFactory } from './callbacks/factory.js';
import createCallback from './callbacks/factory.js';
import { StepType } from '@forgerock/sdk-types';

type JourneyStep = AuthResponse & {
  payload: Step;
  callbacks: JourneyCallback[];
  getCallbackOfType: <T extends JourneyCallback>(type: CallbackType) => T;
  getCallbacksOfType: <T extends JourneyCallback>(type: CallbackType) => T[];
  setCallbackValue: (type: CallbackType, value: unknown) => void;
  getDescription: () => string | undefined;
  getHeader: () => string | undefined;
  getStage: () => string | undefined;
};

function getCallbackOfType<T extends JourneyCallback>(
  callbacks: JourneyCallback[],
  type: CallbackType,
): T {
  const callbacksOfType = getCallbacksOfType<T>(callbacks, type);
  if (callbacksOfType.length !== 1) {
    throw new Error(`Expected 1 callback of type "${type}", but found ${callbacksOfType.length}`);
  }
  return callbacksOfType[0];
}

function getCallbacksOfType<T extends JourneyCallback>(
  callbacks: JourneyCallback[],
  type: CallbackType,
): T[] {
  return callbacks.filter((x) => x.getType() === type) as T[];
}

function setCallbackValue(callbacks: JourneyCallback[], type: CallbackType, value: unknown): void {
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
  callbackFactory?: JourneyCallbackFactory,
): JourneyCallback[] {
  const converted = callbacks.map((x: Callback) => {
    // This gives preference to the provided factory and falls back to our default implementation
    return (callbackFactory || createCallback)(x) || createCallback(x);
  });
  return converted;
}

function createJourneyStep(payload: Step, callbackFactory?: JourneyCallbackFactory): JourneyStep {
  const callbacks = payload.callbacks
    ? convertCallbacks(payload.callbacks, callbackFactory)
    : [];
  return {
    payload,
    callbacks,
    type: StepType.Step,
    getCallbackOfType: <T extends JourneyCallback>(type: CallbackType) =>
      getCallbackOfType<T>(callbacks, type),
    getCallbacksOfType: <T extends JourneyCallback>(type: CallbackType) =>
      getCallbacksOfType<T>(callbacks, type),
    setCallbackValue: (type: CallbackType, value: unknown) =>
      setCallbackValue(callbacks, type, value),
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
