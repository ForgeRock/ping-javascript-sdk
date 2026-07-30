/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Micro } from 'effect';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import { describe, expect, vi } from 'vitest';
import { it } from '@effect/vitest';

import {
  buildChallengeEndpoint,
  classifyPollResponse,
  isChallengeStillPending,
  interpretChallengeResponse,
  getPollingModeµ,
  validatePollingPrerequisitesµ,
} from './client.store.effects.js';
import type { PollDispatchResult } from './client.store.effects.js';
import type { PollingCollector } from './collector.types.js';
import { logger } from '@forgerock/sdk-logger';
import { createClientStore } from './client.store.utils.js';

const mockLog: ReturnType<typeof logger> = {
  changeLevel: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

// ---------------------------------------------------------------------------
// buildChallengeEndpoint
// ---------------------------------------------------------------------------

describe('buildChallengeEndpoint', () => {
  it('returns Right with constructed URL for a valid self link', () => {
    const selfHref =
      'https://auth.pingone.ca/3b2b0d54-99f9-4c28-b57e-d4e66e8e72c2/davinci/orchestrate';
    const challenge = 'abc123';

    const result = buildChallengeEndpoint(selfHref, challenge);

    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe(
      'https://auth.pingone.ca/3b2b0d54-99f9-4c28-b57e-d4e66e8e72c2/davinci/user/credentials/challenge/abc123/status',
    );
  });

  it('returns Left with InternalErrorResponse when envId is missing from URL path', () => {
    // pathname is just '/' → split gives ['', ''] → envId is empty string → falsy
    const selfHref = 'https://auth.pingone.ca/';
    const challenge = 'abc123';

    const result = buildChallengeEndpoint(selfHref, challenge);

    expect(Either.isLeft(result)).toBe(true);
    expect(Option.getOrThrow(Either.getLeft(result))).toMatchObject({ type: 'internal_error' });
  });

  it('returns Left with InternalErrorResponse for a completely invalid URL', () => {
    const result = buildChallengeEndpoint('not-a-url', 'abc123');

    expect(Either.isLeft(result)).toBe(true);
    expect(Option.getOrThrow(Either.getLeft(result))).toMatchObject({ type: 'internal_error' });
  });
});

// ---------------------------------------------------------------------------
// validatePollingPrerequisitesµ
// ---------------------------------------------------------------------------

function makeContinueState(interactionId: string, selfHref: string) {
  const store = createClientStore({});
  store.dispatch({
    type: 'node/next',
    payload: {
      httpStatus: 200,
      requestId: 'test-request',
      data: {
        _links: { self: { href: selfHref } },
        id: 'node-1',
        interactionId,
        interactionToken: 'token',
        eventName: 'continue',
        form: { components: { fields: [] } },
      },
    },
  });
  return store.getState();
}

describe('validatePollingPrerequisitesµ', () => {
  it('fails with state_error when challenge is empty', async () => {
    const state = makeContinueState(
      'interaction-1',
      'https://auth.pingone.ca/env1/davinci/orchestrate',
    );

    const result = await Micro.runPromiseExit(validatePollingPrerequisitesµ(state, ''));

    expect(Micro.exitIsFailure(result)).toBe(true);
    expect(result).toMatchObject({ cause: { error: { type: 'internal_error' } } });
  });

  it('fails with state_error when node is not in continue state', async () => {
    const store = createClientStore({});
    const state = store.getState();

    const result = await Micro.runPromiseExit(validatePollingPrerequisitesµ(state, 'abc123'));

    expect(Micro.exitIsFailure(result)).toBe(true);
    expect(result).toMatchObject({ cause: { error: { type: 'internal_error' } } });
  });

  it('fails with state_error when interactionId is missing', async () => {
    const store = createClientStore({});
    store.dispatch({
      type: 'node/next',
      payload: {
        httpStatus: 200,
        requestId: 'test-request',
        data: {
          _links: { self: { href: 'https://auth.pingone.ca/env1/davinci/orchestrate' } },
          id: 'node-1',
          interactionToken: 'token',
          eventName: 'continue',
          form: { components: { fields: [] } },
        },
      },
    });

    const result = await Micro.runPromiseExit(
      validatePollingPrerequisitesµ(store.getState(), 'abc123'),
    );

    expect(Micro.exitIsFailure(result)).toBe(true);
    expect(result).toMatchObject({ cause: { error: { type: 'internal_error' } } });
  });

  it('succeeds with interactionId and constructed challengeEndpoint', async () => {
    const state = makeContinueState(
      'interaction-abc',
      'https://auth.pingone.ca/3b2b0d54-99f9-4c28-b57e-d4e66e8e72c2/davinci/orchestrate',
    );

    const result = await Micro.runPromiseExit(validatePollingPrerequisitesµ(state, 'abc123'));

    expect(Micro.exitIsSuccess(result)).toBe(true);
    expect(result).toMatchObject({
      value: {
        interactionId: 'interaction-abc',
        challengeEndpoint:
          'https://auth.pingone.ca/3b2b0d54-99f9-4c28-b57e-d4e66e8e72c2/davinci/user/credentials/challenge/abc123/status',
      },
    });
  });
});

// ---------------------------------------------------------------------------
// classifyPollResponse
// ---------------------------------------------------------------------------

describe('classifyPollResponse', () => {
  it("classifies a 400 error with serviceName 'challengeExpired' as _tag: expired", () => {
    const response: PollDispatchResult = {
      error: { status: 400, data: { serviceName: 'challengeExpired' } },
    };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'expired' });
  });

  it('classifies other HTTP errors as _tag: error', () => {
    const response: PollDispatchResult = {
      error: { status: 500, data: { message: 'Server Error' } },
    };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'error' });
  });

  it('classifies a SerializedError as _tag: internalError', () => {
    const response: PollDispatchResult = {
      error: { name: 'SerializedError', message: 'Network failure' },
    };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'internalError' });
  });

  it('classifies non-object data as _tag: error', () => {
    const response: PollDispatchResult = { data: 'just a string' };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'error' });
  });

  it('classifies a completed challenge as _tag: complete with status', () => {
    const response: PollDispatchResult = {
      data: { isChallengeComplete: true, status: 'approved' },
    };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'complete', status: 'approved' });
  });

  it('classifies a completed challenge with missing status as _tag: error', () => {
    const response: PollDispatchResult = { data: { isChallengeComplete: true } };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'error' });
  });

  it('classifies an in-progress challenge as _tag: pending', () => {
    const response: PollDispatchResult = { data: { isChallengeComplete: false } };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'pending' });
  });

  it('classifies a response with no isChallengeComplete field as _tag: pending', () => {
    const response: PollDispatchResult = { data: { someOtherField: 'value' } };
    expect(classifyPollResponse(response)).toMatchObject({ _tag: 'pending' });
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
  it("returns Right 'expired' for a 400 error with serviceName 'challengeExpired'", () => {
    const response: PollDispatchResult = {
      error: { status: 400, data: { serviceName: 'challengeExpired' } },
    };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe('expired');
  });

  it("returns Right 'error' for other HTTP errors (status 500)", () => {
    const response: PollDispatchResult = {
      error: { status: 500, data: { message: 'Server Error' } },
    };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe('error');
  });

  it('returns Left InternalErrorResponse for a SerializedError', () => {
    const response: PollDispatchResult = {
      error: { name: 'SerializedError', message: 'Network failure' },
    };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isLeft(result)).toBe(true);
    expect(Option.getOrThrow(Either.getLeft(result))).toMatchObject({
      type: 'internal_error',
      error: { message: 'Network failure' },
    });
  });

  it("returns Right 'error' for non-object data", () => {
    const response: PollDispatchResult = { data: 'just a string' };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe('error');
  });

  it('returns Right with the status from a completed challenge', () => {
    const response: PollDispatchResult = {
      data: { isChallengeComplete: true, status: 'approved' },
    };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe('approved');
  });

  it("returns Right 'error' when challenge is complete but status is missing", () => {
    const response: PollDispatchResult = { data: { isChallengeComplete: true } };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe('error');
  });

  it("returns Right 'timedOut' for an incomplete challenge when the schedule is exhausted", () => {
    const response: PollDispatchResult = { data: { isChallengeComplete: false } };
    const result = interpretChallengeResponse(response, mockLog);
    expect(Either.isRight(result)).toBe(true);
    expect(Either.getOrThrow(result)).toBe('timedOut');
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
      const badCollector = {
        ...basePollingCollector,
        type: 'TextCollector',
      } as unknown as PollingCollector;

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
