/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * A DaVinci response with a POLLING field (continue polling).
 */
export const continuePolling = {
  interactionId: 'poll-interaction-id',
  interactionToken: 'poll-token',
  _links: { next: { href: 'https://auth.pingone.ca/connections/poll' } },
  eventName: 'continue',
  id: 'poll-node-id',
  form: {
    name: 'Polling Form',
    description: '',
    category: 'CUSTOM_HTML',
    components: {
      fields: [
        {
          type: 'POLLING',
          key: 'polling',
          pollInterval: 2000,
          pollRetries: 5,
        },
      ],
    },
  },
};

/**
 * A DaVinci response with a POLLING field (challenge polling).
 */
export const challengePolling = {
  ...continuePolling,
  form: {
    ...continuePolling.form,
    components: {
      fields: [
        {
          type: 'POLLING',
          key: 'polling',
          pollInterval: 2000,
          pollRetries: 5,
          pollChallengeStatus: true,
          challenge: 'test-challenge-value',
        },
      ],
    },
  },
};
