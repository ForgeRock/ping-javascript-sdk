/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Micro } from 'effect';
import { describe, expect, vi } from 'vitest';
import { it } from '@effect/vitest';

import {
  buildChallengeEndpoint,
  isChallengeStillPending,
  interpretChallengeResponse,
  getPollingModeµ,
} from './client.store.effects.js';
import type { PollDispatchResult } from './client.store.effects.js';
import type { PollingCollector } from './collector.types.js';

const mockLog = {
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
} as any;

// ---------------------------------------------------------------------------
// buildChallengeEndpoint
// ---------------------------------------------------------------------------

describe('buildChallengeEndpoint', () => {
  it('returns a constructed URL string for a valid self link', () => {
    const selfHref =
      'https://auth.pingone.ca/3b2b0d54-99f9-4c28-b57e-d4e66e8e72c2/davinci/orchestrate';
    const challenge = 'abc123';

    const result = buildChallengeEndpoint(selfHref, challenge);

    expect(result).toBe(
      'https://auth.pingone.ca/3b2b0d54-99f9-4c28-b57e-d4e66e8e72c2/davinci/user/credentials/challenge/abc123/status',
    );
  });

  it('returns InternalErrorResponse when envId is missing from URL path', () => {
    // pathname is just '/' → split gives ['', ''] → envId is empty string → falsy
    const selfHref = 'https://auth.pingone.ca/';
    const challenge = 'abc123';

    const result = buildChallengeEndpoint(selfHref, challenge);

    expect(typeof result).toBe('object');
    expect((result as any).type).toBe('internal_error');
  });

  it('returns InternalErrorResponse for a completely invalid URL', () => {
    const result = buildChallengeEndpoint('not-a-url', 'abc123');

    expect(typeof result).toBe('object');
    expect((result as any).type).toBe('internal_error');
  });
});

// ---------------------------------------------------------------------------
// isChallengeStillPending
// ---------------------------------------------------------------------------

describe('isChallengeStillPending', () => {
  it('returns false when response has an error', () => {
    const response: PollDispatchResult = { error: { status: 400, data: {} } };
    expect(isChallengeStillPending(response)).toBe(false);
  });

  it('returns false when isChallengeComplete is true', () => {
    const response: PollDispatchResult = {
      data: { isChallengeComplete: true, status: 'approved' },
    };
    expect(isChallengeStillPending(response)).toBe(false);
  });

  it('returns true when challenge is still pending', () => {
    const response: PollDispatchResult = { data: { isChallengeComplete: false } };
    expect(isChallengeStillPending(response)).toBe(true);
  });

  it('returns true when data has no isChallengeComplete field', () => {
    const response: PollDispatchResult = { data: { someOtherField: 'value' } };
    expect(isChallengeStillPending(response)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// interpretChallengeResponse
// ---------------------------------------------------------------------------

describe('interpretChallengeResponse', () => {
  it("returns 'expired' for a 400 error with serviceName 'challengeExpired'", () => {
    const response: PollDispatchResult = {
      error: { status: 400, data: { serviceName: 'challengeExpired' } },
    };

    const result = interpretChallengeResponse(response, mockLog);

    expect(result).toBe('expired');
  });

  it("returns 'error' for other HTTP errors (status 500)", () => {
    const response: PollDispatchResult = {
      error: { status: 500, data: { message: 'Server Error' } },
    };

    const result = interpretChallengeResponse(response, mockLog);

    expect(result).toBe('error');
  });

  it('returns InternalErrorResponse for a SerializedError (has message, no status)', () => {
    const response: PollDispatchResult = {
      error: { name: 'SerializedError', message: 'Network failure' },
    };

    const result = interpretChallengeResponse(response, mockLog);

    expect(typeof result).toBe('object');
    expect((result as any).type).toBe('internal_error');
    expect((result as any).error.message).toBe('Network failure');
  });

  it("returns 'error' for non-object data", () => {
    const response: PollDispatchResult = { data: 'just a string' };

    const result = interpretChallengeResponse(response, mockLog);

    expect(result).toBe('error');
  });

  it('returns the status from a completed challenge', () => {
    const response: PollDispatchResult = {
      data: { isChallengeComplete: true, status: 'approved' },
    };

    const result = interpretChallengeResponse(response, mockLog);

    expect(result).toBe('approved');
  });

  it("returns 'error' when challenge is complete but status is missing", () => {
    const response: PollDispatchResult = {
      data: { isChallengeComplete: true },
    };

    const result = interpretChallengeResponse(response, mockLog);

    expect(result).toBe('error');
  });

  it("returns 'timedOut' for an incomplete challenge when the schedule is exhausted", () => {
    const response: PollDispatchResult = {
      data: { isChallengeComplete: false },
    };

    const result = interpretChallengeResponse(response, mockLog);

    expect(result).toBe('timedOut');
  });
});

// ---------------------------------------------------------------------------
// getPollingModeµ
// ---------------------------------------------------------------------------

describe('getPollingModeµ', () => {
  const basePollingCollector: PollingCollector = {
    category: 'SingleValueAutoCollector',
    error: null,
    type: 'PollingCollector',
    id: 'polling-0',
    name: 'polling',
    input: { key: 'polling', value: '', type: 'POLLING' },
    output: {
      key: 'polling',
      type: 'POLLING',
      config: { pollInterval: 2000, pollRetries: 5, retriesRemaining: 5 },
    },
  };

  it.effect('succeeds with challenge mode when challenge and pollChallengeStatus are set', () =>
    Micro.gen(function* () {
      const collector: PollingCollector = {
        ...basePollingCollector,
        output: {
          ...basePollingCollector.output,
          config: {
            pollInterval: 2000,
            pollRetries: 5,
            pollChallengeStatus: true,
            challenge: 'test-challenge',
          },
        },
      };

      const result = yield* getPollingModeµ(collector);

      expect(result).toStrictEqual({ _tag: 'challenge', challenge: 'test-challenge' });
    }),
  );

  it.effect('succeeds with continue mode when no challenge is present', () =>
    Micro.gen(function* () {
      const result = yield* getPollingModeµ(basePollingCollector);

      expect(result).toStrictEqual({
        _tag: 'continue',
        retriesRemaining: 5,
        pollInterval: 2000,
      });
    }),
  );

  it.effect('succeeds with unknown mode for ambiguous configuration', () =>
    Micro.gen(function* () {
      const collector: PollingCollector = {
        ...basePollingCollector,
        output: {
          ...basePollingCollector.output,
          config: {
            pollInterval: 2000,
            pollRetries: 5,
            challenge: 'test-challenge',
            // pollChallengeStatus is absent — ambiguous
          },
        },
      };

      const result = yield* getPollingModeµ(collector);

      expect(result).toStrictEqual({ _tag: 'unknown' });
    }),
  );

  it.effect('fails when collector type is not PollingCollector', () =>
    Micro.gen(function* () {
      const badCollector = { ...basePollingCollector, type: 'TextCollector' } as any;

      const result = yield* Micro.exit(getPollingModeµ(badCollector));

      expect(result).toStrictEqual(
        Micro.exitFail({
          error: {
            message: 'Collector provided to poll is not a PollingCollector',
            type: 'argument_error',
          },
          type: 'internal_error',
        }),
      );
    }),
  );

  it.effect('fails when retriesRemaining is undefined in continue mode', () =>
    Micro.gen(function* () {
      const collector: PollingCollector = {
        ...basePollingCollector,
        output: {
          ...basePollingCollector.output,
          config: { pollInterval: 2000, pollRetries: 5 },
        },
      };

      const result = yield* Micro.exit(getPollingModeµ(collector));

      expect(result).toStrictEqual(
        Micro.exitFail({
          error: {
            message: 'No retries found on PollingCollector',
            type: 'argument_error',
          },
          type: 'internal_error',
        }),
      );
    }),
  );
});
