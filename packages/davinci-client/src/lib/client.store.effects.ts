/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Micro } from 'effect';
import { SerializedError } from '@reduxjs/toolkit/react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import type { logger as loggerFn } from '@forgerock/sdk-logger';

import type { ClientStore, RootState } from './client.store.utils.js';
import type { PollingStatus, InternalErrorResponse } from './client.types.js';
import type { PollingCollector } from './collector.types.js';

import { createInternalError, isInternalError } from './client.store.utils.js';
import { davinciApi } from './davinci.api.js';
import { nodeSlice } from './node.slice.js';

/**
 * Shape returned by RTK Query's dispatch for the poll endpoint.
 */
export interface PollDispatchResult {
  data?: unknown;
  error?: FetchBaseQueryError | SerializedError;
}

/**
 * Validated prerequisites needed to initiate challenge polling.
 */
interface PollingPrerequisites {
  interactionId: string;
  challengeEndpoint: string;
}

/**
 * Discriminated union representing the validated polling mode.
 */
export type PollingMode =
  | { _tag: 'challenge'; challenge: string }
  | { _tag: 'continue'; retriesRemaining: number; pollInterval: number }
  | { _tag: 'unknown' };

/**
 * Type guard: determines if a value is a plain object (Record<string, unknown>).
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Determines the polling mode for a given PollingCollector.
 * Succeeds with a discriminated PollingMode, or fails with InternalErrorResponse.
 */
export function getPollingModeµ(
  collector: PollingCollector,
): Micro.Micro<PollingMode, InternalErrorResponse> {
  if (collector.type !== 'PollingCollector') {
    return Micro.fail(
      createInternalError('Collector provided to poll is not a PollingCollector', 'argument_error'),
    );
  }

  const { pollChallengeStatus, challenge, retriesRemaining, pollInterval } =
    collector.output.config;

  if (challenge && pollChallengeStatus === true) {
    return Micro.succeed({ _tag: 'challenge', challenge });
  }

  if (!challenge && !pollChallengeStatus) {
    if (retriesRemaining === undefined) {
      return Micro.fail(
        createInternalError('No retries found on PollingCollector', 'argument_error'),
      );
    }
    return Micro.succeed({
      _tag: 'continue',
      retriesRemaining,
      pollInterval: pollInterval ?? 2000,
    });
  }

  return Micro.succeed({ _tag: 'unknown' });
}

/**
 * Constructs the challenge polling endpoint from a self link URL.
 * Returns InternalErrorResponse if URL cannot be parsed, instead of throwing.
 */
export function buildChallengeEndpoint(
  selfHref: string,
  challenge: string,
): string | InternalErrorResponse {
  try {
    const url = new URL(selfHref);
    const envId = url.pathname.split('/')[1];

    if (!url.origin || !envId) {
      return createInternalError(
        'Failed to construct challenge polling endpoint. Requires host and environment ID.',
        'parse_error',
      );
    }

    return `${url.origin}/${envId}/davinci/user/credentials/challenge/${challenge}/status`;
  } catch {
    return createInternalError(
      'Failed to construct challenge polling endpoint. Requires host and environment ID.',
      'parse_error',
    );
  }
}

/**
 * Lifts a selector result with { error, state } shape into a Micro.
 * Succeeds with state when error is null, fails with InternalErrorResponse otherwise.
 */
function fromSelectorµ<T>(result: {
  error: { message: string } | null;
  state: T;
}): Micro.Micro<NonNullable<T>, InternalErrorResponse> {
  return result.error
    ? Micro.fail(createInternalError(result.error.message, 'state_error'))
    : Micro.succeed(result.state as NonNullable<T>);
}

/**
 * Validates all prerequisites for challenge polling and constructs the endpoint URL.
 * validate challenge → select server → select self link → build endpoint → assemble
 */
export function validatePollingPrerequisitesµ(
  rootState: RootState,
  challenge: string,
): Micro.Micro<PollingPrerequisites, InternalErrorResponse> {
  if (!challenge) {
    return Micro.fail(
      createInternalError('No challenge found on collector for poll operation', 'state_error'),
    );
  }

  return fromSelectorµ(nodeSlice.selectors.selectContinueServer(rootState)).pipe(
    Micro.filterOrFail(
      (server) => !!server.interactionId,
      () =>
        createInternalError(
          'Missing interactionId in server info for challenge polling',
          'state_error',
        ),
    ),
    Micro.flatMap((server) =>
      fromSelectorµ(nodeSlice.selectors.selectSelfLink(rootState)).pipe(
        Micro.map((selfLink) => ({ server, selfLink })),
      ),
    ),
    Micro.flatMap(({ server, selfLink }) => {
      const endpoint = buildChallengeEndpoint(selfLink, challenge);
      return typeof endpoint === 'string'
        ? Micro.succeed({
            interactionId: server.interactionId!,
            challengeEndpoint: endpoint,
          })
        : Micro.fail(endpoint);
    }),
  );
}

/**
 * Pure predicate: determines if challenge polling should continue.
 * Returns true when the challenge has not yet completed and no error occurred.
 */
export function isChallengeStillPending(response: PollDispatchResult): boolean {
  if (response.error) return false;

  const data = isRecord(response.data) ? response.data : undefined;
  if (data?.['isChallengeComplete']) return false;

  return true;
}

export function interpretChallengeResponse(
  response: PollDispatchResult,
  log: ReturnType<typeof loggerFn>,
): PollingStatus | InternalErrorResponse {
  const { data, error } = response;

  if (error) {
    // FetchBaseQueryError — has status field
    if ('status' in error) {
      const errorDetails = isRecord(error.data) ? error.data : undefined;
      const serviceName = errorDetails?.['serviceName'];

      // Expired challenge is an expected polling outcome, not a failure
      if (error.status === 400 && serviceName === 'challengeExpired') {
        log.debug('Challenge expired for polling');
        return 'expired';
      }

      // Other HTTP errors are also expected outcomes (e.g. bad challenge returning 400 with code 4019)
      log.debug('Unknown error occurred during polling');
      return 'error';
    }

    // SerializedError — has message field
    const message =
      'message' in error && error.message
        ? error.message
        : 'An unknown error occurred while challenge polling';

    return createInternalError(message, 'unknown_error');
  }

  if (!isRecord(data)) {
    log.debug('Unable to parse polling response');
    return 'error';
  }

  // Challenge completed — extract status
  if (data['isChallengeComplete'] === true) {
    const pollStatus = data['status'];
    return pollStatus ? (pollStatus as PollingStatus) : 'error';
  }

  // If we reach here, Micro.repeat exhausted its schedule without the challenge completing
  log.debug('Challenge polling timed out');
  return 'timedOut';
}

/**
 * Builds a Micro effect for the challenge polling branch.
 * validate → dispatch → repeat → interpret → lift errors
 */
function challengePollingµ({
  collector,
  challenge,
  store,
  log,
}: {
  collector: PollingCollector;
  challenge: string;
  store: ReturnType<ClientStore>;
  log: ReturnType<typeof loggerFn>;
}): Micro.Micro<PollingStatus, InternalErrorResponse> {
  const maxRetries = collector.output.config.pollRetries ?? 60;
  const pollInterval = collector.output.config.pollInterval ?? 2000;

  return validatePollingPrerequisitesµ(store.getState(), challenge).pipe(
    Micro.flatMap(({ interactionId, challengeEndpoint }) =>
      Micro.promise(() =>
        store.dispatch(
          davinciApi.endpoints.poll.initiate({
            endpoint: challengeEndpoint,
            interactionId,
          }),
        ),
      ),
    ),
    Micro.repeat({
      while: isChallengeStillPending,
      // `times` tracks repetitions after the initial attempt, so decrement by one
      times: maxRetries - 1,
      schedule: Micro.scheduleSpaced(pollInterval),
    }),
    Micro.map((response) => interpretChallengeResponse(response, log)),
    Micro.flatMap((result) =>
      isInternalError(result) ? Micro.fail(result) : Micro.succeed(result),
    ),
  );
}

/**
 * Builds a Micro effect for the continue polling branch.
 * If retries remain, delays by pollInterval then returns 'continue'.
 * If retries are exhausted, returns 'timedOut' immediately.
 */
function continuePollingµ(
  mode: Extract<PollingMode, { _tag: 'continue' }>,
): Micro.Micro<PollingStatus, InternalErrorResponse> {
  if (mode.retriesRemaining <= 0) {
    return Micro.succeed('timedOut' as PollingStatus);
  }
  return Micro.sleep(mode.pollInterval).pipe(Micro.map(() => 'continue'));
}

/**
 * Routes a validated PollingMode to the appropriate polling effect.
 * This is the single entry point — the caller lifts getPollingMode into Micro, pipes through this.
 */
export function pollingµ({
  mode,
  collector,
  store,
  log,
}: {
  mode: PollingMode;
  collector: PollingCollector;
  store: ReturnType<ClientStore>;
  log: ReturnType<typeof loggerFn>;
}): Micro.Micro<PollingStatus, InternalErrorResponse> {
  if (mode._tag === 'challenge') {
    return challengePollingµ({ collector, challenge: mode.challenge, store, log });
  }

  if (mode._tag === 'continue') {
    return continuePollingµ(mode);
  }

  return Micro.fail(
    createInternalError('Invalid polling collector configuration', 'argument_error'),
  );
}
