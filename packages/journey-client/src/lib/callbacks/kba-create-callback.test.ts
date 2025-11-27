/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { KbaCreateCallback } from './kba-create-callback.js';

describe('KbaCreateCallback', () => {
  const payload: Callback = {
    type: callbackType.KbaCreateCallback,
    output: [
      {
        name: 'prompt',
        value: 'What is your favorite color?',
      },
      {
        name: 'predefinedQuestions',
        value: ['Question 1', 'Question 2'],
      },
      {
        name: 'allowUserDefinedQuestions',
        value: true,
      },
    ],
    input: [
      {
        name: 'IDToken1question',
        value: '',
      },
      {
        name: 'IDToken1answer',
        value: '',
      },
    ],
  };

  it('should allow getting the prompt and questions', () => {
    const cb = new KbaCreateCallback(payload);
    expect(cb.getPrompt()).toBe('What is your favorite color?');
    expect(cb.getPredefinedQuestions()).toEqual(['Question 1', 'Question 2']);
  });

  it('should allow setting the question and answer', () => {
    const cb = new KbaCreateCallback(payload);
    cb.setQuestion('My custom question');
    cb.setAnswer('Blue');
    expect(cb.getInputValue('IDToken1question')).toBe('My custom question');
    expect(cb.getInputValue('IDToken1answer')).toBe('Blue');
  });

  it('should indicate if user-defined questions are allowed', () => {
    const cb = new KbaCreateCallback(payload);
    expect(cb.isAllowedUserDefinedQuestions()).toBe(true);
  });
});
