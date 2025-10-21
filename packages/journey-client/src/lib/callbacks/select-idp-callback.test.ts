/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import { Callback } from '@forgerock/sdk-types';

import { SelectIdPCallback } from './select-idp-callback.js';

describe('SelectIdPCallback', () => {
  const payload: Callback = {
    type: callbackType.SelectIdPCallback,
    output: [
      {
        name: 'providers',
        value: [
          { provider: 'google', uiConfig: {} },
          { provider: 'facebook', uiConfig: {} },
        ],
      },
    ],
    input: [
      {
        name: 'IDToken1',
        value: '',
      },
    ],
  };

  it('should allow getting the providers', () => {
    const cb = new SelectIdPCallback(payload);
    expect(cb.getProviders()).toHaveLength(2);
    expect(cb.getProviders()[0].provider).toBe('google');
  });

  it('should allow setting the provider', () => {
    const cb = new SelectIdPCallback(payload);
    cb.setProvider('facebook');
    expect(cb.getInputValue()).toBe('facebook');
  });

  it('should throw an error for an invalid provider', () => {
    const cb = new SelectIdPCallback(payload);
    expect(() => cb.setProvider('twitter')).toThrow('"twitter" is not a valid choice');
  });
});
