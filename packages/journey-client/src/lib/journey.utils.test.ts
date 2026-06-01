/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, expect, it } from 'vitest';

import { StepType } from '../types.js';
import { type Step } from '../index.js';

import { createJourneyObject, handleJourneyResponse } from './journey.utils.js';
import type { JourneyLoginFailure } from './login-failure.utils.js';

describe('createJourneyObject', () => {
  it('returns Step when provided a step with authId', () => {
    const stepPayload: Step = {
      authId: 'test-auth-id',
      callbacks: [],
    };

    const result = createJourneyObject(stepPayload);

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

    const result = createJourneyObject(successPayload);

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('type', StepType.LoginSuccess);
    expect(result).toHaveProperty('payload', successPayload);
  });

  it('returns LoginFailure when provided a step without authId or successUrl', () => {
    const failurePayload: Step = {
      code: 401,
      message: 'Access Denied',
      reason: 'Unauthorized',
      detail: { failureUrl: 'https://example.com/failure' },
    };

    const result = createJourneyObject(failurePayload);

    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('type', StepType.LoginFailure);
    expect(result).toHaveProperty('payload', failurePayload);

    const failure = result as JourneyLoginFailure;
    expect(failure.getCode()).toBe(401);
    expect(failure.getMessage()).toBe('Access Denied');
    expect(failure.getReason()).toBe('Unauthorized');
  });
});

describe('handleJourneyResponse', () => {
  it('returns Step data when FetchBaseQueryError has numeric status and object body', () => {
    const body = { code: 401, message: 'Access Denied', reason: 'Unauthorized' };
    const error = { status: 401, data: body };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toBe(body);
  });

  it('returns GenericError when FetchBaseQueryError has numeric status but non-object body', () => {
    const error = { status: 500, data: 'Internal Server Error' };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toMatchObject({ error: 'request_failed', type: 'unknown_error' });
  });

  it('returns GenericError for FETCH_ERROR', () => {
    const error = { status: 'FETCH_ERROR' as const, error: 'Network error' };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toMatchObject({ error: 'request_failed', type: 'unknown_error' });
    expect((result as { message: string }).message).toContain('Network error');
  });

  it('returns GenericError for PARSING_ERROR', () => {
    const error = {
      status: 'PARSING_ERROR' as const,
      originalStatus: 200,
      data: '<html>Not JSON</html>',
      error: 'JSON parse error',
    };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toMatchObject({ error: 'request_failed', type: 'unknown_error' });
    expect((result as { message: string }).message).toContain('JSON parse error');
  });

  it('returns GenericError for TIMEOUT_ERROR', () => {
    const error = { status: 'TIMEOUT_ERROR' as const, error: 'Request timed out' };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toMatchObject({ error: 'request_failed', type: 'unknown_error' });
    expect((result as { message: string }).message).toContain('Request timed out');
  });

  it('returns GenericError for CUSTOM_ERROR', () => {
    const error = { status: 'CUSTOM_ERROR' as const, error: 'Custom error occurred' };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toMatchObject({ error: 'request_failed', type: 'unknown_error' });
    expect((result as { message: string }).message).toContain('Custom error occurred');
  });

  it('returns GenericError for SerializedError', () => {
    const error = { name: 'Error', message: 'Something went wrong', stack: '...' };

    const result = handleJourneyResponse(undefined, error);

    expect(result).toMatchObject({ error: 'request_failed', type: 'unknown_error' });
    expect((result as { message: string }).message).toContain('Something went wrong');
  });

  it('returns GenericError when no data and no error', () => {
    const result = handleJourneyResponse(undefined, undefined);

    expect(result).toMatchObject({ error: 'no_response_data', type: 'unknown_error' });
  });

  it('returns data when no error and data is present', () => {
    const data: Step = { authId: 'test-auth-id', callbacks: [] };

    const result = handleJourneyResponse(data, undefined);

    expect(result).toBe(data);
  });
});
