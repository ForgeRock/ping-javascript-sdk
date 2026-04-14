/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect } from 'vitest';

import { nodeSlice } from './node.slice.js';
import { next0 } from './mock-data/davinci.next.mock.js';
import { nodeNext0 } from './mock-data/node.next.mock.js';
import { success0, success1 } from './mock-data/davinci.success.mock.js';
import { nodeSuccess0, nodeSuccess1 } from './mock-data/node.success.mock.js';
import { error0a, error2b, error3 } from './mock-data/davinci.error.mock.js';
import { continuePolling } from './mock-data/node.poll.mock.js';
import type { ContinueNode } from './node.types.js';

describe('The node slice reducers', () => {
  it('should return the initial state', () => {
    expect(nodeSlice.reducer(undefined, { type: 'node/start', payload: [] })).toEqual({
      cache: null,
      client: {
        status: 'start',
      },
      error: null,
      server: {
        status: 'start',
      },
      status: 'start',
    });
  });

  it('should handle next node with one field', () => {
    const action = {
      type: 'node/next',
      payload: {
        data: next0,
        requestId: '1234',
        httpStatus: 200,
      },
    };

    expect(nodeSlice.reducer(undefined, action)).toEqual(nodeNext0);
  });

  it('should clear error when we successfully process a node with a next', () => {
    const actionError = {
      type: 'node/error',
      payload: {
        data: error0a,
        requestId: '1234',
        httpStatus: 400,
      },
    };
    const errorState = {
      cache: {
        key: '1234',
      },
      client: {
        status: 'error' as const,
      },
      error: {
        code: ' Invalid username and/or password',
        collectors: [],
        message: ' Invalid username and/or password',
        internalHttpStatus: 400,
        status: 'error',
        type: 'davinci_error',
      },
      httpStatus: 400,
      server: {
        status: 'error',
      },
      status: 'error',
    };
    const errorStateReducer = nodeSlice.reducer(undefined, actionError);
    expect(errorStateReducer).toEqual(errorState);

    const action = {
      type: 'node/next',
      payload: {
        data: next0,
        requestId: '1234',
        httpStatus: 200,
      },
    };
    expect(nodeSlice.reducer(errorStateReducer, action)).toEqual(nodeNext0);
  });
  it('should handle success node after DaVinci flow', () => {
    const action = {
      type: 'node/success',
      payload: {
        data: success0,
        requestId: '1234',
        httpStatus: 200,
      },
    };

    expect(nodeSlice.reducer(undefined, action)).toEqual(nodeSuccess0);
  });

  it('should handle success node with valid, existing session', () => {
    const action = {
      type: 'node/success',
      payload: {
        data: success1,
        requestId: '1234',
        httpStatus: 200,
      },
    };

    expect(nodeSlice.reducer(undefined, action)).toEqual(nodeSuccess1);
  });

  it('should clear error when we successfully process a node', () => {
    const action = {
      type: 'node/error',
      payload: {
        data: error0a,
        requestId: '1234',
        httpStatus: 400,
      },
    };
    const errorState = {
      cache: {
        key: '1234',
      },
      client: {
        status: 'error' as const,
      },
      error: {
        code: ' Invalid username and/or password',
        collectors: [],
        message: ' Invalid username and/or password',
        internalHttpStatus: 400,
        status: 'error',
        type: 'davinci_error',
      },
      httpStatus: 400,
      server: {
        status: 'error',
      },
      status: 'error',
    };
    const errorStateReducer = nodeSlice.reducer(undefined, action);
    expect(errorStateReducer).toEqual(errorState);

    const actionSuccess = {
      type: 'node/success',
      payload: {
        data: success1,
        requestId: '1234',
        httpStatus: 200,
      },
    };
    expect(nodeSlice.reducer(errorStateReducer, actionSuccess)).toEqual(nodeSuccess1);
  });

  it('should handle error node', () => {
    const action = {
      type: 'node/error',
      payload: {
        data: error0a,
        requestId: '1234',
        httpStatus: 400,
      },
    };

    expect(nodeSlice.reducer(undefined, action)).toEqual({
      cache: {
        key: '1234',
      },
      client: {
        status: 'error',
      },
      error: {
        code: ' Invalid username and/or password',
        collectors: [],
        message: ' Invalid username and/or password',
        internalHttpStatus: 400,
        status: 'error',
        type: 'davinci_error',
      },
      httpStatus: 400,
      server: {
        status: 'error',
      },
      status: 'error',
    });
  });

  it('should handle time out failure response', () => {
    const action = {
      type: 'node/failure',
      payload: {
        data: error2b,
        requestId: '1234',
        httpStatus: 400,
      },
    };

    expect(nodeSlice.reducer(undefined, action)).toEqual({
      cache: {
        key: '1234',
      },
      client: {
        status: 'failure',
      },
      error: {
        code: 'unknown',
        message: '',
        internalHttpStatus: 0,
        status: 'failure',
        type: 'davinci_error',
      },
      httpStatus: 400,
      server: {
        status: 'failure',
      },
      status: 'failure',
    });
  });

  it('should handle failure node', () => {
    const action = {
      type: 'node/failure',
      payload: {
        data: error3,
        requestId: '1234',
        httpStatus: 400,
      },
    };

    expect(nodeSlice.reducer(undefined, action)).toEqual({
      cache: {
        key: '1234',
      },
      client: {
        status: 'failure',
      },
      error: {
        code: 1999,
        message: 'Unauthorized!',
        internalHttpStatus: 401,
        status: 'failure',
        type: 'davinci_error',
      },
      httpStatus: 400,
      server: {
        status: 'failure',
      },
      status: 'failure',
    });
  });

  it('should decrement retriesRemaining and update cache key on poll', () => {
    // Build a continue state from a node that contains a PollingCollector.
    const continueState = nodeSlice.reducer(undefined, {
      type: 'node/next',
      payload: { data: continuePolling, requestId: '1234', httpStatus: 200 },
    });

    // Dispatch a single poll action with a new requestId
    const result = nodeSlice.reducer(continueState, {
      type: 'node/poll',
      payload: { requestId: '5678' },
    });

    // Cache key must reflect the latest requestId
    expect(result.cache).toEqual({ key: '5678' });
    // Node must remain in the continue state — poll does not change the node type
    expect(result.status).toBe('continue');

    // retriesRemaining must have decreased by 1 (5 → 4)
    const pollingCollector = (result as ContinueNode).client.collectors.find(
      (c) => c.type === 'PollingCollector',
    );
    expect(pollingCollector?.output.config.retriesRemaining).toBe(4);
  });
});

describe('nodeSlice.selectors.selectContinueServer', () => {
  const continueState: ContinueNode = {
    cache: { key: 'test-key' },
    client: { action: 'test', collectors: [], status: 'continue' },
    error: null,
    httpStatus: 200,
    server: {
      _links: { self: { href: 'https://auth.pingone.ca/envId/davinci/connections/abc' } },
      interactionId: 'interaction-123',
      status: 'continue',
    },
    status: 'continue',
  };

  it('returns the server when node is in continue state', () => {
    const result = nodeSlice.selectors.selectContinueServer({ node: continueState });
    expect(result).toEqual({ error: null, state: continueState.server });
  });

  it('returns an error when node is not in continue state (initial start state)', () => {
    const result = nodeSlice.selectors.selectContinueServer({ node: nodeSlice.getInitialState() });
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe('state_error');
    expect(result.state).toBeNull();
  });
});

describe('nodeSlice.selectors.selectSelfLink', () => {
  const continueState: ContinueNode = {
    cache: { key: 'test-key' },
    client: { action: 'test', collectors: [], status: 'continue' },
    error: null,
    httpStatus: 200,
    server: {
      _links: { self: { href: 'https://auth.pingone.ca/envId/davinci/connections/abc' } },
      interactionId: 'interaction-123',
      status: 'continue',
    },
    status: 'continue',
  };

  it('returns the self link href when in continue state with self link present', () => {
    const result = nodeSlice.selectors.selectSelfLink({ node: continueState });
    expect(result).toEqual({
      error: null,
      state: 'https://auth.pingone.ca/envId/davinci/connections/abc',
    });
  });

  it('returns an error when not in continue state', () => {
    const result = nodeSlice.selectors.selectSelfLink({ node: nodeSlice.getInitialState() });
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe('state_error');
    expect(result.state).toBeNull();
  });

  it('returns an error when in continue state but self link is missing', () => {
    const stateWithoutSelfLink: ContinueNode = {
      ...continueState,
      server: {
        ...continueState.server,
        _links: { other: { href: 'https://example.com' } },
      },
    };
    const result = nodeSlice.selectors.selectSelfLink({ node: stateWithoutSelfLink });
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe('state_error');
    expect(result.state).toBeNull();
  });
});
