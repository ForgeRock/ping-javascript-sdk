/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { ChoiceCallback } from './choice-callback.js';

describe('ChoiceCallback', () => {
  const payload: Callback = {
    type: callbackType.ChoiceCallback,
    output: [
      {
        name: 'prompt',
        value: 'Select an option',
      },
      {
        name: 'choices',
        value: ['one', 'two', 'three'],
      },
      {
        name: 'defaultChoice',
        value: 1,
      },
    ],
    input: [
      {
        name: 'IDToken1',
        value: 0,
      },
    ],
  };

  it('should allow getting the prompt', () => {
    const cb = new ChoiceCallback(payload);
    expect(cb.getPrompt()).toBe('Select an option');
  });

  it('should allow getting the choices', () => {
    const cb = new ChoiceCallback(payload);
    expect(cb.getChoices()).toEqual(['one', 'two', 'three']);
  });

  it('should allow getting the default choice', () => {
    const cb = new ChoiceCallback(payload);
    expect(cb.getDefaultChoice()).toBe(1);
  });

  it('should allow setting the choice by index', () => {
    const cb = new ChoiceCallback(payload);
    cb.setChoiceIndex(2);
    expect(cb.getInputValue()).toBe(2);
  });

  it('should throw an error for an out-of-bounds index', () => {
    const cb = new ChoiceCallback(payload);
    expect(() => cb.setChoiceIndex(3)).toThrow('3 is out of bounds');
    expect(() => cb.setChoiceIndex(-1)).toThrow('-1 is out of bounds');
  });

  it('should allow setting the choice by value', () => {
    const cb = new ChoiceCallback(payload);
    cb.setChoiceValue('two');
    expect(cb.getInputValue()).toBe(1);
  });

  it('should throw an error for an invalid choice value', () => {
    const cb = new ChoiceCallback(payload);
    expect(() => cb.setChoiceValue('four')).toThrow('"four" is not a valid choice');
  });
});
