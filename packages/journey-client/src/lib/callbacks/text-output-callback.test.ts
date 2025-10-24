/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import { Callback } from '@forgerock/sdk-types';

import { TextOutputCallback } from './text-output-callback.js';

describe('TextOutputCallback', () => {
  const payload: Callback = {
    type: callbackType.TextOutputCallback,
    output: [
      {
        name: 'message',
        value: 'This is a message',
      },
      {
        name: 'messageType',
        value: '0',
      },
    ],
    input: [],
  };

  it('should allow getting the message and message type', () => {
    const cb = new TextOutputCallback(payload);
    expect(cb.getMessage()).toBe('This is a message');
    expect(cb.getMessageType()).toBe('0');
  });
});
