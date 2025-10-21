/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { TermsAndConditionsCallback } from './terms-and-conditions-callback.js';

describe('TermsAndConditionsCallback', () => {
  const date = new Date().toString();
  const payload: Callback = {
    type: callbackType.TermsAndConditionsCallback,
    output: [
      {
        name: 'terms',
        value: 'Lorem ipsum...',
      },
      {
        name: 'version',
        value: '1.0',
      },
      {
        name: 'createDate',
        value: date,
      },
    ],
    input: [
      {
        name: 'IDToken1',
        value: false,
      },
    ],
  };

  it('should allow getting terms, version, and date', () => {
    const cb = new TermsAndConditionsCallback(payload);
    expect(cb.getTerms()).toBe('Lorem ipsum...');
    expect(cb.getVersion()).toBe('1.0');
    expect(cb.getCreateDate()).toEqual(new Date(date));
  });

  it('should allow setting acceptance', () => {
    const cb = new TermsAndConditionsCallback(payload);
    cb.setAccepted(true);
    expect(cb.getInputValue()).toBe(true);
    cb.setAccepted(false);
    expect(cb.getInputValue()).toBe(false);
  });
});
