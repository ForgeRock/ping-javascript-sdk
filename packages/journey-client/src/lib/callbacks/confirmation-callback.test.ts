/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { ConfirmationCallback } from './confirmation-callback.js';

describe('ConfirmationCallback', () => {
  const payload: Callback = {
    type: callbackType.ConfirmationCallback,
    output: [
      {
        name: 'prompt',
        value: 'Are you sure?',
      },
      {
        name: 'messageType',
        value: 0,
      },
      {
        name: 'options',
        value: ['Yes', 'No'],
      },
      {
        name: 'optionType',
        value: -1,
      },
      {
        name: 'defaultOption',
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
    const cb = new ConfirmationCallback(payload);
    expect(cb.getPrompt()).toBe('Are you sure?');
  });

  it('should allow getting the message type', () => {
    const cb = new ConfirmationCallback(payload);
    expect(cb.getMessageType()).toBe(0);
  });

  it('should allow getting the options', () => {
    const cb = new ConfirmationCallback(payload);
    expect(cb.getOptions()).toEqual(['Yes', 'No']);
  });

  it('should allow getting the option type', () => {
    const cb = new ConfirmationCallback(payload);
    expect(cb.getOptionType()).toBe(-1);
  });

  it('should allow getting the default option', () => {
    const cb = new ConfirmationCallback(payload);
    expect(cb.getDefaultOption()).toBe(1);
  });

  it('should allow setting the option by index', () => {
    const cb = new ConfirmationCallback(payload);
    cb.setOptionIndex(1);
    expect(cb.getInputValue()).toBe(1);
  });

  it('should throw an error for an invalid index', () => {
    const cb = new ConfirmationCallback(payload);
    expect(() => cb.setOptionIndex(2)).toThrow('"2" is not a valid choice');
  });

  it('should allow setting the option by value', () => {
    const cb = new ConfirmationCallback(payload);
    cb.setOptionValue('No');
    expect(cb.getInputValue()).toBe(1);
  });

  it('should throw an error for an invalid value', () => {
    const cb = new ConfirmationCallback(payload);
    expect(() => cb.setOptionValue('Maybe')).toThrow('"Maybe" is not a valid choice');
  });
});
