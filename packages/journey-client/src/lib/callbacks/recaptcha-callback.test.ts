/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, expect, it } from 'vitest';

import { ReCaptchaCallback } from './recaptcha-callback.js';

import type { Callback } from '@forgerock/sdk-types';

describe('ReCaptchaCallback', () => {
  const payload: Callback = {
    type: callbackType.ReCaptchaCallback,
    output: [
      {
        name: 'recaptchaSiteKey',
        value: 'test-site-key',
      },
    ],
    input: [
      {
        name: 'IDToken1',
        value: '',
      },
    ],
  };

  it('should allow getting the site key', () => {
    const cb = new ReCaptchaCallback(payload);
    expect(cb.getSiteKey()).toBe('test-site-key');
  });

  it('should allow setting the result', () => {
    const cb = new ReCaptchaCallback(payload);
    cb.setResult('recaptcha-response-token');
    expect(cb.getInputValue()).toBe('recaptcha-response-token');
  });
});
