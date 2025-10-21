/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import { Callback } from '@forgerock/sdk-types';

import { MetadataCallback } from './metadata-callback.js';

describe('MetadataCallback', () => {
  it('should allow getting the data', () => {
    const mockData = { foo: 'bar', baz: 123 };
    const payload: Callback = {
      type: callbackType.MetadataCallback,
      output: [
        {
          name: 'data',
          value: mockData,
        },
      ],
      input: [],
    };
    const cb = new MetadataCallback(payload);
    expect(cb.getData()).toEqual(mockData);
  });
});
