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
import type { NodeStates, PollingStatus, InternalErrorResponse } from './client.types.js';
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
 * Discriminated union representing the validated polling mode, with all config
 * baked in at construction. Branches consume the mode directly — no re-reading
 * of collector config and no scattered `?? default` fallbacks.
 */
export type PollingMode =
  | { _tag: 'challenge'; challenge: string; pollInterval: number; maxAttempts: number }
  | { _tag: 'continue'; pollInterval: number };

const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_CHALLENGE_MAX_ATTEMPTS = 60;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Determines the polling mode for a given PollingCollector. Any invalid
 * configuration fails directly — no ghost 'unknown' tag downstream.
 */
export function getPollingModeµ(
  collector: PollingCollector,
): Micro.Micro<PollingMode, InternalErrorResponse> {
  if (collector.type !== 'PollingCollector') {
    return Micro.fail(
      createInternalError('Collector provided to poll is not a PollingCollector', 'argument_error'),
    );
  }

  const { pollChallengeStatus, challenge, retriesRemaining, pollInterval, pollRetries } =
    collector.output.config;

  if (challenge && pollChallengeStatus === true) {
    return Micro.succeed({
      _tag: 'challenge',
      challenge,
      pollInterval: pollInterval ?? DEFAULT_POLL_INTERVAL_MS,
      maxAttempts: pollRetries ?? DEFAULT_CHALLENGE_MAX_ATTEMPTS,
    });
  }

  if (!challenge && !pollChallengeStatus) {
    if (retriesRemaining === undefined) {
      return Micro.fail(
        createInternalError('No retries found on PollingCollector', 'argument_error'),
      );
    }
    return Micro.succeed({
      _tag: 'continue',
      pollInterval: pollInterval ?? DEFAULT_POLL_INTERVAL_MS,
    });
  }

  return Micro.fail(
    createInternalError('Invalid polling collector configuration', 'argument_error'),
  );
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
 * Classification of a single challenge-poll response. Both the `while`
 * predicate and the terminal switch are projections of this outcome — one
 * inspection of the response, two uses.
 */
export type ChallengeOutcome =
  | { _tag: 'pending' }
  | { _tag: 'completed'; status: PollingStatus }
  | { _tag: 'expired' }
  | { _tag: 'responseError' }
  | { _tag: 'internalError'; error: InternalErrorResponse };

export function classifyChallengeResponse(response: PollDispatchResult): ChallengeOutcome {
  const { data, error } = response;

  if (error) {
    // FetchBaseQueryError — has status field
    if ('status' in error) {
      const errorDetails = isRecord(error.data) ? error.data : undefined;
      const serviceName = errorDetails?.['serviceName'];

      if (error.status === 400 && serviceName === 'challengeExpired') {
        return { _tag: 'expired' };
      }

      return { _tag: 'responseError' };
    }

    // SerializedError — has message field
    const message =
      'message' in error && error.message
        ? error.message
        : 'An unknown error occurred while challenge polling';

    return {
      _tag: 'internalError',
      error: createInternalError(message, 'unknown_error'),
    };
  }

  if (!isRecord(data)) {
    return { _tag: 'responseError' };
  }

  if (data['isChallengeComplete'] === true) {
    const status = data['status'];
    return status
      ? { _tag: 'completed', status: status as PollingStatus }
      : { _tag: 'responseError' };
  }

  return { _tag: 'pending' };
}

/**
 * Shape returned from one iteration of continue polling — the latest node and the
 * next PollingCollector the server wants us to use (or null if the flow advanced).
 */
export interface PollingContinuation {
  node: NodeStates;
  nextPollingCollector: PollingCollector | null;
}

/**
 * Pure snapshot of the current node and whether the server still wants polling.
 * The caller decides whether to loop based on `nextPollingCollector`.
 */
export function evaluatePollingContinuation(rootState: RootState): PollingContinuation {
  const node = nodeSlice.selectSlice(rootState);
  const { state: collectors } = nodeSlice.selectors.selectCollectors(rootState);

  for (const c of collectors ?? []) {
    if (c.type === 'PollingCollector') {
      return { node, nextPollingCollector: c };
    }
  }

  return { node, nextPollingCollector: null };
}

/**
 * Stamps the PollingCollector's input.value, dispatches `next`, and resolves with
 * the resulting NodeStates. The value is what `transformSubmitRequest` inspects to
 * set `eventType: 'polling'` on the wire.
 */
function advanceFlowµ({
  store,
  collectorId,
  pollingValue,
}: {
  store: ReturnType<ClientStore>;
  collectorId: string;
  pollingValue: string;
}): Micro.Micro<NodeStates, InternalErrorResponse> {
  return Micro.sync(() =>
    store.dispatch(nodeSlice.actions.update({ id: collectorId, value: pollingValue })),
  ).pipe(
    Micro.flatMap(() =>
      Micro.promise(() => store.dispatch(davinciApi.endpoints.next.initiate(undefined))),
    ),
    Micro.map(() => nodeSlice.selectSlice(store.getState())),
  );
}

/**
 * Challenge polling branch. All config comes from the mode; the loop body stays
 * thin: dispatch → repeat while pending → classify terminal → branch.
 */
function challengePollingµ({
  mode,
  store,
  collectorId,
  log,
}: {
  mode: Extract<PollingMode, { _tag: 'challenge' }>;
  store: ReturnType<ClientStore>;
  collectorId: string;
  log: ReturnType<typeof loggerFn>;
}): Micro.Micro<NodeStates, InternalErrorResponse> {
  return validatePollingPrerequisitesµ(store.getState(), mode.challenge).pipe(
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
      while: (r) => classifyChallengeResponse(r)._tag === 'pending',
      // `times` tracks repetitions after the initial attempt, so decrement by one
      times: mode.maxAttempts - 1,
      schedule: Micro.scheduleSpaced(mode.pollInterval),
    }),
    Micro.flatMap((response): Micro.Micro<NodeStates, InternalErrorResponse> => {
      const outcome = classifyChallengeResponse(response);
      switch (outcome._tag) {
        case 'completed':
          return advanceFlowµ({ store, collectorId, pollingValue: outcome.status });
        case 'expired':
          log.debug('Challenge expired for polling');
          return advanceFlowµ({ store, collectorId, pollingValue: 'expired' });
        case 'responseError':
          log.debug('Unknown error occurred during polling');
          return Micro.fail(createInternalError('Challenge polling error', 'unknown_error'));
        case 'pending':
          // Micro.repeat exhausted its schedule without the challenge completing
          log.debug('Challenge polling timed out');
          return Micro.fail(createInternalError('Challenge polling timedOut', 'unknown_error'));
        case 'internalError':
          return Micro.fail(outcome.error);
        default:
          outcome satisfies never;
          throw new Error('Unreachable polling outcome');
      }
    }),
  );
}

/**
 * Continue polling branch. Repeats while the server keeps returning a
 * PollingCollector on a 'continue' node; stops once the flow advances.
 */
function continuePollingµ({
  mode,
  store,
  collectorId,
}: {
  mode: Extract<PollingMode, { _tag: 'continue' }>;
  store: ReturnType<ClientStore>;
  collectorId: string;
}): Micro.Micro<NodeStates, InternalErrorResponse> {
  return Micro.sleep(mode.pollInterval).pipe(
    Micro.flatMap(() => advanceFlowµ({ store, collectorId, pollingValue: 'continue' })),
    Micro.map(() => evaluatePollingContinuation(store.getState())),
    Micro.repeat({
      while: ({ node, nextPollingCollector }) =>
        node.status === 'continue' && nextPollingCollector !== null,
    }),
    Micro.map(({ node }) => node),
  );
}

/**
 * Routes a validated PollingMode to the appropriate polling effect.
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
}): Micro.Micro<NodeStates, InternalErrorResponse> {
  if (mode._tag === 'challenge') {
    return challengePollingµ({ mode, store, collectorId: collector.id, log });
  }

  return continuePollingµ({ mode, store, collectorId: collector.id });
}
