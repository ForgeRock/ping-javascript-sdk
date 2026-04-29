/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, expect, it } from 'vitest';

import { StepType, type Step } from '@forgerock/sdk-types';

import { createJourneyObject } from './journey.utils.js';
import type { JourneyLoginFailure } from './login-failure.utils.js';

describe('createJourneyObject', () => {
  it('returns Step when provided a step with authId', () => {
    const stepPayload: Step = {
      authId: 'test-auth-id',
      callbacks: [],
    };

    const result = createJourneyObject(stepPayload, undefined);

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('type', StepType.Step);
    expect(result).toHaveProperty('payload');
    expect((result as { payload: Step }).payload).toEqual(stepPayload);
  });

  it('returns LoginSuccess when provided a step with successUrl', () => {
    const successPayload: Step = {
      successUrl: 'https://example.com/success',
      realm: 'root',
      tokenId: 'token-123',
    };

    const result = createJourneyObject(successPayload, undefined);

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('type', StepType.LoginSuccess);
    expect(result).toHaveProperty('payload', successPayload);
  });

  it('returns no_response_data GenericError when no step and no error', () => {
    const result = createJourneyObject(undefined, undefined);

    expect(result).toMatchObject({
      error: 'no_response_data',
      message: 'No data received from server',
      type: 'unknown_error',
    });
  });

  it('returns request_failed GenericError when no step but error exists', () => {
    const result = createJourneyObject(undefined, { status: 500 });

    expect(result).toMatchObject({
      error: 'request_failed',
      message: 'Request failed: 500',
      type: 'unknown_error',
    });
  });

  it('returns request_failed when error.data is present but not Step-like', () => {
    const result = createJourneyObject(undefined, { status: 401, data: { foo: 'bar' } });

    expect(result).toMatchObject({
      error: 'request_failed',
      message: 'Request failed: 401',
      type: 'unknown_error',
    });
  });

  it('returns LoginFailure when error.data contains a failure Step payload', () => {
    const failurePayload: Step = {
      code: 401,
      message: 'Access Denied',
      reason: 'Unauthorized',
      detail: { failureUrl: 'https://example.com/failure' },
    };

    const result = createJourneyObject(undefined, { status: 401, data: failurePayload });

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('type', StepType.LoginFailure);
    expect(result).toHaveProperty('payload', failurePayload);

    const failure = result as JourneyLoginFailure;
    expect(failure.getCode()).toBe(401);
    expect(failure.getMessage()).toBe('Access Denied');
    expect(failure.getReason()).toBe('Unauthorized');
  });
});
