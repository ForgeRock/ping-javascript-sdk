/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { PollingWaitCallback } from './polling-wait-callback.js';

describe('PollingWaitCallback', () => {
  const payload: Callback = {
    type: callbackType.PollingWaitCallback,
    output: [
      {
        name: 'message',
        value: 'Please wait...',
      },
      {
        name: 'waitTime',
        value: '5000',
      },
    ],
    input: [],
  };

  it('should allow getting the message and wait time', () => {
    const cb = new PollingWaitCallback(payload);
    expect(cb.getMessage()).toBe('Please wait...');
    expect(cb.getWaitTime()).toBe(5000);
  });
});
