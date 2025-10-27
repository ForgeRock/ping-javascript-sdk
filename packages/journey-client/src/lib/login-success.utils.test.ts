/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { StepType } from '@forgerock/sdk-types';
import { describe, expect, it } from 'vitest';

import { createJourneyLoginSuccess } from './login-success.utils.js';

describe('createJourneyLoginSuccess', () => {
  it('should create a JourneyLoginSuccess object', () => {
    const step = {
      realm: 'my-realm',
      tokenId: 'my-token',
      successUrl: 'my-success-url',
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const journeyLoginSuccess = createJourneyLoginSuccess(step);

    expect(journeyLoginSuccess.type).toBe(StepType.LoginSuccess);
    expect(journeyLoginSuccess.payload).toEqual(step);
    expect(journeyLoginSuccess.getRealm()).toBe('my-realm');
    expect(journeyLoginSuccess.getSessionToken()).toBe('my-token');
    expect(journeyLoginSuccess.getSuccessUrl()).toBe('my-success-url');
  });
});
