/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, expect, it } from 'vitest';

import { StepType } from '../types.js';
import { createJourneyObject, parseJourneyResponse } from './journey.utils.js';

import type { Step } from '../index.js';
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

describe('parseJourneyResponse', () => {
  it('returns right(Step) when FetchBaseQueryError has numeric status and object body', () => {
    const body = { code: 401, message: 'Access Denied', reason: 'Unauthorized' };
    const error = { status: 401, data: body };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Right');
    expect((result as { right: unknown }).right).toBe(body);
  });

  it('returns left(GenericError) when FetchBaseQueryError has numeric status but non-object body', () => {
    const error = { status: 500, data: 'Internal Server Error' };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Left');
    expect((result as { left: unknown }).left).toMatchObject({
      error: 'request_failed',
      type: 'unknown_error',
    });
  });

  it('returns left(GenericError) for FETCH_ERROR', () => {
    const error = { status: 'FETCH_ERROR' as const, error: 'Network error' };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Left');
    expect((result as { left: { message: string } }).left.message).toContain('Network error');
  });

  it('returns left(GenericError) for PARSING_ERROR', () => {
    const error = {
      status: 'PARSING_ERROR' as const,
      originalStatus: 200,
      data: '<html>Not JSON</html>',
      error: 'JSON parse error',
    };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Left');
    expect((result as { left: { message: string } }).left.message).toContain('JSON parse error');
  });

  it('returns left(GenericError) for TIMEOUT_ERROR', () => {
    const error = { status: 'TIMEOUT_ERROR' as const, error: 'Request timed out' };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Left');
    expect((result as { left: { message: string } }).left.message).toContain('Request timed out');
  });

  it('returns left(GenericError) for CUSTOM_ERROR', () => {
    const error = { status: 'CUSTOM_ERROR' as const, error: 'Custom error occurred' };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Left');
    expect((result as { left: { message: string } }).left.message).toContain(
      'Custom error occurred',
    );
  });

  it('returns left(GenericError) for SerializedError', () => {
    const error = { name: 'Error', message: 'Something went wrong', stack: '...' };

    const result = parseJourneyResponse({ data: undefined, error });

    expect(result._tag).toBe('Left');
    expect((result as { left: { message: string } }).left.message).toContain(
      'Something went wrong',
    );
  });

  it('returns left(GenericError) when no data and no error', () => {
    const result = parseJourneyResponse({ data: undefined, error: undefined });

    expect(result._tag).toBe('Left');
    expect((result as { left: unknown }).left).toMatchObject({
      error: 'no_response_data',
      type: 'unknown_error',
    });
  });

  it('returns right(Step) when no error and data is present', () => {
    const data: Step = { authId: 'test-auth-id', callbacks: [] };

    const result = parseJourneyResponse({ data, error: undefined });

    expect(result._tag).toBe('Right');
    expect((result as { right: unknown }).right).toBe(data);
  });
});
