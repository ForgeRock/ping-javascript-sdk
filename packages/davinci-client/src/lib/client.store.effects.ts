/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Micro } from 'effect';
import * as Either from 'effect/Either';
import { SerializedError } from '@reduxjs/toolkit/react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import type { logger as loggerFn } from '@forgerock/sdk-logger';

import type { ClientStore, RootState } from './client.store.utils.js';
import type { PollingStatus, InternalErrorResponse } from './client.types.js';
import type { PollingCollector } from './collector.types.js';

import { createInternalError } from './client.store.utils.js';
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
): Either.Either<string, InternalErrorResponse> {
  const parseError = createInternalError(
    'Failed to construct challenge polling endpoint. Requires host and environment ID.',
    'parse_error',
  );

  return Either.try({ try: () => new URL(selfHref), catch: () => parseError }).pipe(
    Either.flatMap((url) => {
      const envId = url.pathname.split('/')[1];
      return url.origin && envId
        ? Either.right(
            `${url.origin}/${envId}/davinci/user/credentials/challenge/${challenge}/status`,
          )
        : Either.left(parseError);
    }),
  );
}

function fromSelector<T>(result: {
  error: { message: string } | null;
  state: T;
}): Either.Either<NonNullable<T>, InternalErrorResponse> {
  return result.error
    ? Either.left(createInternalError(result.error.message, 'state_error'))
    : Either.right(result.state as NonNullable<T>);
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

  return Micro.fromEither(fromSelector(nodeSlice.selectors.selectContinueServer(rootState))).pipe(
    Micro.filterOrFail(
      (server) => !!server.interactionId,
      () =>
        createInternalError(
          'Missing interactionId in server info for challenge polling',
          'state_error',
        ),
    ),
    Micro.flatMap((server) =>
      Micro.fromEither(fromSelector(nodeSlice.selectors.selectSelfLink(rootState))).pipe(
        Micro.map((selfLink) => ({ server, selfLink })),
      ),
    ),
    Micro.flatMap(({ server, selfLink }) =>
      Either.match(buildChallengeEndpoint(selfLink, challenge), {
        onLeft: Micro.fail,
        onRight: (challengeEndpoint) =>
          Micro.succeed({ interactionId: server.interactionId as string, challengeEndpoint }),
      }),
    ),
  );
}

type PollClassification =
  | { _tag: 'expired' }
  | { _tag: 'error' }
  | { _tag: 'internalError'; error: InternalErrorResponse }
  | { _tag: 'complete'; status: PollingStatus }
  | { _tag: 'pending' };

export function classifyPollResponse(response: PollDispatchResult): PollClassification {
  const { data, error } = response;

  if (error) {
    if ('status' in error) {
      const errorDetails = isRecord(error.data) ? error.data : undefined;
      if (error.status === 400 && errorDetails?.['serviceName'] === 'challengeExpired') {
        return { _tag: 'expired' };
      }
      return { _tag: 'error' };
    }

    const message =
      'message' in error && error.message
        ? error.message
        : 'An unknown error occurred while challenge polling';
    return { _tag: 'internalError', error: createInternalError(message, 'unknown_error') };
  }

  if (!isRecord(data)) return { _tag: 'error' };

  if (data['isChallengeComplete'] === true) {
    const status = data['status'];
    return status ? { _tag: 'complete', status: status as PollingStatus } : { _tag: 'error' };
  }

  return { _tag: 'pending' };
}

export function isChallengeStillPending(response: PollDispatchResult): boolean {
  return classifyPollResponse(response)._tag === 'pending';
}

export function interpretChallengeResponse(
  response: PollDispatchResult,
  log: ReturnType<typeof loggerFn>,
): Either.Either<PollingStatus, InternalErrorResponse> {
  const classification = classifyPollResponse(response);

  switch (classification._tag) {
    case 'expired':
      log.debug('Challenge expired for polling');
      return Either.right('expired');
    case 'error':
      log.debug('Unknown error occurred during polling');
      return Either.right('error');
    case 'internalError':
      return Either.left(classification.error);
    case 'complete':
      return Either.right(classification.status);
    case 'pending':
      log.debug('Challenge polling timed out');
      return Either.right('timedOut');
    default: {
      const exhaustive: never = classification;
      throw new Error(`Unhandled poll classification: ${JSON.stringify(exhaustive)}`);
    }
  }
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
    Micro.flatMap((response) => Micro.fromEither(interpretChallengeResponse(response, log))),
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
