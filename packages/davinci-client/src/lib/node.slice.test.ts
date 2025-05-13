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
});
