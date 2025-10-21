/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import { Callback } from '@forgerock/sdk-types';

import { SuspendedTextOutputCallback } from './suspended-text-output-callback.js';

describe('SuspendedTextOutputCallback', () => {
  it('should instantiate correctly and inherit from TextOutputCallback', () => {
    const payload: Callback = {
      type: callbackType.SuspendedTextOutputCallback,
      output: [
        {
          name: 'message',
          value: 'Suspended message',
        },
        {
          name: 'messageType',
          value: '0',
        },
      ],
      input: [],
    };
    const cb = new SuspendedTextOutputCallback(payload);
    expect(cb.getMessage()).toBe('Suspended message');
    expect(cb.getMessageType()).toBe('0');
  });
});
