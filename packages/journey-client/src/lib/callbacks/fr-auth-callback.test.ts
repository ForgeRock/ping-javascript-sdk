/*
 * @forgerock/ping-javascript-sdk
 *
 * fr-auth-callback.test.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';

import type { Callback } from '@forgerock/sdk-types';

import { JourneyCallback } from './index.js';

describe('JourneyCallback', () => {
  it('reads/writes basic properties', () => {
    const payload: Callback = {
      _id: 0,
      input: [
        {
          name: 'userName',
          value: '',
        },
      ],
      output: [
        {
          name: 'prompt',
          value: 'Username:',
        },
      ],
      type: callbackType.NameCallback,
    };
    const cb = new JourneyCallback(payload);
    cb.setInputValue('superman');

    expect(cb.getType()).toBe('NameCallback');
    expect(cb.getOutputValue('prompt')).toBe('Username:');
    expect(cb.getInputValue()).toBe('superman');
  });
});
