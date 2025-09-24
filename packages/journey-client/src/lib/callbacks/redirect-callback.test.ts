/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { callbackType, type Callback } from '@forgerock/sdk-types';
import RedirectCallback from './redirect-callback.js';

describe('RedirectCallback', () => {
  const payload: Callback = {
    type: callbackType.RedirectCallback,
    output: [
      {
        name: 'redirectUrl',
        value: 'https://am.example.com/callback?param=value',
      },
    ],
    input: [],
  };

  it('should allow getting the redirect URL', () => {
    const cb = new RedirectCallback(payload);
    expect(cb.getRedirectUrl()).toBe('https://am.example.com/callback?param=value');
  });
});
