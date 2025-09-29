/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { callbackType, type Callback } from '@forgerock/sdk-types';
import NameCallback from './name-callback.js';

describe('NameCallback', () => {
  const payload: Callback = {
    type: callbackType.NameCallback,
    output: [
      {
        name: 'prompt',
        value: 'Username',
      },
    ],
    input: [
      {
        name: 'IDToken1',
        value: '',
      },
    ],
  };

  it('should allow getting the prompt', () => {
    const cb = new NameCallback(payload);
    expect(cb.getPrompt()).toBe('Username');
  });

  it('should allow setting the name', () => {
    const cb = new NameCallback(payload);
    cb.setName('test-user');
    expect(cb.getInputValue()).toBe('test-user');
  });
});
