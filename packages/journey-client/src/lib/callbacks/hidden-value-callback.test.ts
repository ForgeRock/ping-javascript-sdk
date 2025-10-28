/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { HiddenValueCallback } from './hidden-value-callback.js';

describe('HiddenValueCallback', () => {
  it('should instantiate correctly', () => {
    const payload: Callback = {
      type: callbackType.HiddenValueCallback,
      output: [{ name: 'value', value: 'some-hidden-value' }],
      input: [{ name: 'IDToken1', value: '' }],
    };
    const cb = new HiddenValueCallback(payload);
    expect(cb).toBeInstanceOf(HiddenValueCallback);
    expect(cb.getOutputValue('value')).toBe('some-hidden-value');
  });
});
