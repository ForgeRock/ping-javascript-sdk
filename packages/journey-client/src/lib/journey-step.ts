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

/**
 * Represents a single step of an authentication tree.
 */
class JourneyStep implements AuthResponse {
  /**
   * The type of step.
   */
  public readonly type = StepType.Step;

  /**
   * The callbacks contained in this step.
   */
  public callbacks: JourneyCallback[] = [];

  /**
   * @param payload The raw payload returned by OpenAM
   * @param callbackFactory A function that returns am implementation of JourneyCallback
   */
  constructor(
    public payload: Step,
    callbackFactory?: JourneyCallbackFactory,
  ) {
    if (payload.callbacks) {
      this.callbacks = this.convertCallbacks(payload.callbacks, callbackFactory);
    }
  }

  /**
   * Gets the first callback of the specified type in this step.
   *
   * @param type The type of callback to find.
   */
  public getCallbackOfType<T extends JourneyCallback>(type: CallbackType): T {
    const callbacks = this.getCallbacksOfType<T>(type);
    if (callbacks.length !== 1) {
      throw new Error(`Expected 1 callback of type "${type}", but found ${callbacks.length}`);
    }
    return callbacks[0];
  }

  /**
   * Gets all callbacks of the specified type in this step.
   *
   * @param type The type of callback to find.
   */
  public getCallbacksOfType<T extends JourneyCallback>(type: CallbackType): T[] {
    return this.callbacks.filter((x) => x.getType() === type) as T[];
  }

  /**
   * Sets the value of the first callback of the specified type in this step.
   *
   * @param type The type of callback to find.
   * @param value The value to set for the callback.
   */
  public setCallbackValue(type: CallbackType, value: unknown): void {
    const callbacks = this.getCallbacksOfType(type);
    if (callbacks.length !== 1) {
      throw new Error(`Expected 1 callback of type "${type}", but found ${callbacks.length}`);
    }
    callbacks[0].setInputValue(value);
  }

  /**
   * Gets the step's description.
   */
  public getDescription(): string | undefined {
    return this.payload.description;
  }

  /**
   * Gets the step's header.
   */
  public getHeader(): string | undefined {
    return this.payload.header;
  }

  /**
   * Gets the step's stage.
   */
  public getStage(): string | undefined {
    return this.payload.stage;
  }

  private convertCallbacks(
    callbacks: Callback[],
    callbackFactory?: JourneyCallbackFactory,
  ): JourneyCallback[] {
    const converted = callbacks.map((x: Callback) => {
      // This gives preference to the provided factory and falls back to our default implementation
      return (callbackFactory || createCallback)(x) || createCallback(x);
    });
    return converted;
  }
}

/**
 * A function that can populate the provided authentication tree step.
 */
type JourneyStepHandler = (step: JourneyStep) => void;

export default JourneyStep;
export type { JourneyStepHandler };
