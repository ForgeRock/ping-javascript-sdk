/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Step } from '@forgerock/sdk-types';

import { createJourneyStep } from './journey-step.utils.js';
import { NameCallback } from './callbacks/name-callback.js';

describe('fr-step.ts', () => {
  const stepPayload: Step = {
    authId: '123',
    callbacks: [
      {
        type: callbackType.NameCallback,
        input: [{ name: 'IDToken1', value: '' }],
        output: [{ name: 'prompt', value: 'Username' }],
      },
      {
        type: callbackType.PasswordCallback,
        input: [{ name: 'IDToken2', value: '' }],
        output: [{ name: 'prompt', value: 'Password' }],
      },
      {
        type: callbackType.NameCallback, // Duplicate for testing
        input: [{ name: 'IDToken3', value: '' }],
        output: [{ name: 'prompt', value: 'Username 2' }],
      },
    ],
    description: 'Step description',
    header: 'Step header',
    stage: 'Step stage',
  };

  it('should correctly initialize with a payload', () => {
    const step = createJourneyStep(stepPayload);
    expect(step.payload).toEqual(stepPayload);
    expect(step.callbacks).toHaveLength(3);
    expect(step.callbacks[0]).toBeInstanceOf(NameCallback);
  });

  it('should get a single callback of a specific type', () => {
    const singleCallbackPayload: Step = { ...stepPayload, callbacks: [stepPayload.callbacks![1]] };
    const step = createJourneyStep(singleCallbackPayload);
    const cb = step.getCallbackOfType(callbackType.PasswordCallback);
    expect(cb).toBeDefined();
    expect(cb.getType()).toBe(callbackType.PasswordCallback);
  });

  it('should throw an error if getCallbackOfType finds no matching callbacks', () => {
    const step = createJourneyStep(stepPayload);
    const err = `Expected 1 callback of type "TermsAndConditionsCallback", but found 0`;
    expect(() => step.getCallbackOfType(callbackType.TermsAndConditionsCallback)).toThrow(err);
  });

  it('should throw an error if getCallbackOfType finds multiple matching callbacks', () => {
    const step = createJourneyStep(stepPayload);
    const err = `Expected 1 callback of type "NameCallback", but found 2`;
    expect(() => step.getCallbackOfType(callbackType.NameCallback)).toThrow(err);
  });

  it('should get all callbacks of a specific type', () => {
    const step = createJourneyStep(stepPayload);
    const callbacks = step.getCallbacksOfType(callbackType.NameCallback);
    expect(callbacks).toHaveLength(2);
    expect(callbacks[0].getType()).toBe(callbackType.NameCallback);
    expect(callbacks[1].getType()).toBe(callbackType.NameCallback);
  });

  it('should return an empty array if getCallbacksOfType finds no matches', () => {
    const step = createJourneyStep(stepPayload);
    const callbacks = step.getCallbacksOfType(callbackType.TermsAndConditionsCallback);
    expect(callbacks).toHaveLength(0);
  });

  it('should set the value of a specific callback', () => {
    const singleCallbackPayload: Step = { ...stepPayload, callbacks: [stepPayload.callbacks![1]] };
    const step = createJourneyStep(singleCallbackPayload);
    step.setCallbackValue(callbackType.PasswordCallback, 'password123');
    const cb = step.getCallbackOfType(callbackType.PasswordCallback);
    expect(cb.getInputValue()).toBe('password123');
  });

  it('should return the description', () => {
    const step = createJourneyStep(stepPayload);
    expect(step.getDescription()).toBe('Step description');
  });

  it('should return the header', () => {
    const step = createJourneyStep(stepPayload);
    expect(step.getHeader()).toBe('Step header');
  });

  it('should return the stage', () => {
    const step = createJourneyStep(stepPayload);
    expect(step.getStage()).toBe('Step stage');
  });
});
