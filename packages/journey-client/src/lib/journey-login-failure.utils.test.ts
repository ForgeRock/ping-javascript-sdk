/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, expect, it } from 'vitest';
import { createJourneyLoginFailure } from './journey-login-failure.utils';
import { StepType } from '@forgerock/sdk-types';

describe('createJourneyLoginFailure', () => {
  it('should create a JourneyLoginFailure object', () => {
    const step = {
      code: 400,
      detail: { failureUrl: 'failure-url' },
      message: 'Invalid credentials',
      reason: 'INVALID_CREDENTIALS',
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const journeyLoginFailure = createJourneyLoginFailure(step);

    expect(journeyLoginFailure.type).toBe(StepType.LoginFailure);
    expect(journeyLoginFailure.payload).toEqual(step);
    expect(journeyLoginFailure.getCode()).toBe(400);
    expect(journeyLoginFailure.getDetail()).toEqual({ failureUrl: 'failure-url' });
    expect(journeyLoginFailure.getMessage()).toBe('Invalid credentials');
    expect(journeyLoginFailure.getReason()).toBe('INVALID_CREDENTIALS');
  });
});
