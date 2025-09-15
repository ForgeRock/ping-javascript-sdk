/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { callbackType, type Callback } from '@forgerock/sdk-types';
import PasswordCallback from './password-callback.js';

describe('PasswordCallback', () => {
  const payload: Callback = {
    type: callbackType.PasswordCallback,
    output: [
      {
        name: 'prompt',
        value: 'Password',
      },
      {
        name: 'policies',
        value: ['policy1', 'policy2'],
      },
      {
        name: 'failedPolicies',
        value: ['failedPolicy1'],
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
    const cb = new PasswordCallback(payload);
    expect(cb.getPrompt()).toBe('Password');
  });

  it('should allow getting policies', () => {
    const cb = new PasswordCallback(payload);
    expect(cb.getPolicies()).toEqual(['policy1', 'policy2']);
  });

  it('should allow getting failed policies', () => {
    const cb = new PasswordCallback(payload);
    expect(cb.getFailedPolicies()).toEqual(['failedPolicy1']);
  });

  it('should allow setting the password', () => {
    const cb = new PasswordCallback(payload);
    cb.setPassword('new-password');
    expect(cb.getInputValue()).toBe('new-password');
  });
});
