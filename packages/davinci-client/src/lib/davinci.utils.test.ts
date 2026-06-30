/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect, vi } from 'vitest';

import { logger } from '@forgerock/sdk-logger';

import {
  handleResponse,
  classifyResponse,
  transformSubmitRequest,
  transformActionRequest,
} from './davinci.utils.js';

import type { ContinueNode } from './node.types.d.ts';
import { next0 } from './mock-data/davinci.next.mock.js';
import { DaVinciCacheEntry } from './davinci.types.js';
import { error0a, error3 } from './mock-data/davinci.error.mock.js';
import { success0 } from './mock-data/davinci.success.mock.js';

describe('transformSubmitRequest', () => {
  it('should transform node state to DaVinciRequest for next request', () => {
    const node: ContinueNode = {
      cache: {
        key: '123',
      },
      client: {
        action: 'SIGNON',
        collectors: [
          {
            category: 'SingleValueCollector',
            error: null,
            input: { key: 'username', value: 'john', type: 'TEXT' },
            output: { key: 'username', label: 'Username', type: 'TEXT', value: '' },
            type: 'TextCollector',
            id: 'abc',
            name: 'username',
          },
          {
            category: 'SingleValueCollector',
            error: null,
            input: { key: 'password', value: 'secret', type: 'PASSWORD' },
            output: { key: 'password', label: 'Password', type: 'PASSWORD', verify: false },
            type: 'PasswordCollector',
            id: 'xyz',
            name: 'password',
          },
        ],
        status: 'continue' as const,
      },
      error: null,
      httpStatus: 200,
      server: {
        id: '123',
        eventName: 'login',
        interactionId: '456',
        status: 'continue' as const,
      },
      status: 'continue',
    };

    const expectedRequest = {
      id: '123',
      eventName: 'login',
      interactionId: '456',
      parameters: {
        eventType: 'submit',
        data: {
          actionKey: 'SIGNON',
          formData: {
            username: 'john',
            password: 'secret',
          },
        },
      },
    };

    const result = transformSubmitRequest(node, logger({ level: 'none' }));
    expect(result).toEqual(expectedRequest);
  });

  it('should return empty formData when there are no action collectors', () => {
    const node: ContinueNode = {
      cache: {
        key: '123',
      },
      client: {
        action: 'SIGNON',
        collectors: [],
        status: 'continue' as const,
      },
      error: null,
      httpStatus: 200,
      server: {
        id: '123',
        eventName: 'login',
        interactionId: '456',
        status: 'continue' as const,
      },
      status: 'continue' as const,
    };

    const expectedRequest = {
      id: '123',
      eventName: 'login',
      interactionId: '456',
      parameters: {
        eventType: 'submit',
        data: {
          actionKey: 'SIGNON',
          formData: {},
        },
      },
    };

    const result = transformSubmitRequest(node, logger({ level: 'none' }));
    expect(result).toEqual(expectedRequest);
  });

  it('should set eventType to "submit" when PollingCollector exists but has no payload', () => {
    const node: ContinueNode = {
      cache: {
        key: '123',
      },
      client: {
        action: 'SIGNON',
        collectors: [
          {
            category: 'SingleValueAutoCollector',
            error: null,
            type: 'PollingCollector',
            id: 'polling-field-2',
            name: 'polling-field',
            input: {
              key: 'polling-field',
              value: '',
              type: 'POLLING',
            },
            output: {
              key: 'polling-field',
              type: 'POLLING',
              config: {
                pollInterval: 2000,
                pollRetries: 20,
                pollChallengeStatus: true,
                challenge: '123_456-7890',
              },
            },
          },
        ],
        status: 'continue',
      },
      error: null,
      httpStatus: 200,
      server: {
        id: '123',
        eventName: 'login',
        interactionId: '456',
        status: 'continue',
      },
      status: 'continue',
    };

    const result = transformSubmitRequest(node, logger({ level: 'none' }));
    expect(result.parameters.eventType).toBe('submit');
  });

  it('should set eventType to "polling" when PollingCollector has populated payload', () => {
    const node: ContinueNode = {
      cache: {
        key: '123',
      },
      client: {
        action: 'SIGNON',
        collectors: [
          {
            category: 'SingleValueAutoCollector',
            error: null,
            type: 'PollingCollector',
            id: 'polling-field-2',
            name: 'polling-field',
            input: {
              key: 'polling-field',
              value: 'complete',
              type: 'POLLING',
            },
            output: {
              key: 'polling-field',
              type: 'POLLING',
              config: {
                pollInterval: 2000,
                pollRetries: 20,
                pollChallengeStatus: true,
                challenge: '123_456-7890',
              },
            },
          },
        ],
        status: 'continue',
      },
      error: null,
      httpStatus: 200,
      server: {
        id: '123',
        eventName: 'login',
        interactionId: '456',
        status: 'continue',
      },
      status: 'continue',
    };

    const result = transformSubmitRequest(node, logger({ level: 'none' }));
    expect(result.parameters.eventType).toBe('polling');
  });
});

describe('transformActionRequest', () => {
  it('should transform node state to DaVinciRequest for action request', () => {
    const node: ContinueNode = {
      cache: {
        key: '123',
      },
      client: {
        action: 'SIGNON',
        collectors: [],
        status: 'continue' as const,
      },
      error: null,
      httpStatus: 200,
      server: {
        id: '123',
        eventName: 'click',
        interactionId: '456',
        status: 'continue' as const,
      },
      status: 'continue' as const,
    };
    const action = 'TEST_ACTION';

    const expectedRequest = {
      id: '123',
      eventName: 'click',
      interactionId: '456',
      parameters: {
        eventType: 'action',
        data: {
          actionKey: 'TEST_ACTION',
        },
      },
    };

    const result = transformActionRequest(node, action, logger({ level: 'none' }));
    expect(result).toEqual(expectedRequest);
  });
});

// ---------------------------------------------------------------------------
// classifyResponse
// ---------------------------------------------------------------------------

describe('classifyResponse', () => {
  it('classifies a next response as _tag: next', () => {
    const cacheEntry = {
      data: next0,
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 200);

    expect(result).toMatchObject({ _tag: 'next' });
  });

  it('classifies a success response as _tag: success', () => {
    const cacheEntry = {
      data: success0,
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 200);

    expect(result).toMatchObject({ _tag: 'success' });
  });

  it('classifies a recoverable 4XX error as _tag: error with logMessage', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: error0a, status: 400 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 400);

    expect(result).toMatchObject({
      _tag: 'error',
      logMessage: 'Response with this error type should be recoverable',
    });
  });

  it('classifies a 5XX error as _tag: failure with logMessage', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: {}, status: 500 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 500);

    expect(result).toMatchObject({
      _tag: 'failure',
      logMessage: 'Response of 5XX indicates unrecoverable failure',
    });
  });

  it('classifies a timeout error (code 1999) as _tag: failure with logMessage', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: error3, status: 400 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 400);

    expect(result).toMatchObject({ _tag: 'failure', logMessage: 'Error is a client-side timeout' });
  });

  it('classifies a pingOneAuthenticationConnector failure as _tag: failure with logMessage', () => {
    const cacheEntry = {
      data: undefined,
      error: {
        data: {
          connectorId: 'pingOneAuthenticationConnector',
          capabilityName: 'returnSuccessResponseRedirect',
        },
        status: 400,
      },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 400);

    expect(result).toMatchObject({
      _tag: 'failure',
      logMessage: 'Error is a PingOne Authentication Connector unrecoverable failure',
    });
  });

  it('classifies a FETCH_ERROR as _tag: failure with logMessage', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: {}, status: 'FETCH_ERROR' },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 0);

    expect(result).toMatchObject({
      _tag: 'failure',
      logMessage:
        'Response with FETCH_ERROR indicates configuration failure. Please ensure a correct Client ID for your OAuth application.',
    });
  });

  it('classifies a 2XX response with error property as _tag: failure with logMessage', () => {
    const cacheEntry = {
      data: { error: { code: 'unknown', status: 400 } },
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 200);

    expect(result).toMatchObject({
      _tag: 'failure',
      logMessage: 'Response with `isSuccess` but `error` property indicates unrecoverable failure',
    });
  });

  it('classifies a 2XX response with status:failure as _tag: failure with logMessage', () => {
    const cacheEntry = {
      data: { status: 'failure' },
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;

    const result = classifyResponse(cacheEntry, 200);

    expect(result).toMatchObject({
      _tag: 'failure',
      logMessage:
        'Response with `isSuccess` and `status` of "failure" indicates unrecoverable failure',
    });
  });
});

describe('handleResponse', () => {
  it('should handle a next response', () => {
    const cacheEntry = {
      data: next0,
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 200;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/next');
  });

  it('should handle a success response', () => {
    const cacheEntry = {
      data: success0,
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 200;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/success');
  });

  it('should handle an error response', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: error0a, status: 400 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 400;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/error');
  });

  it('should handle an error response', () => {
    const cacheEntry = {
      data: {
        error: {
          code: 'unknown',
          status: 400,
        },
      },
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 400;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/failure');
  });

  it('should handle an error response', () => {
    const cacheEntry = {
      data: {
        status: 'failure',
      },
      error: undefined,
      requestId: '123',
      status: 'fulfilled',
      isError: false,
      isSuccess: true,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 400;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/failure');
  });

  it('should handle an failure with specific capability and connector response', () => {
    const cacheEntry = {
      data: undefined,
      error: {
        data: {
          connectorId: 'pingOneAuthenticationConnector',
          capabilityName: 'returnSuccessResponseRedirect',
        },
        status: 400,
      },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 400;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/failure');
  });

  it('should handle an failure from timeout response', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: error3, status: 400 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 400;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/failure');
  });

  it('should handle an 500 failure response', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: {}, status: 500 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const status = 500;

    handleResponse(cacheEntry, dispatch, status, logger({ level: 'none' }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('node/failure');
  });

  it('logs the classification-specific message via logger', () => {
    const cacheEntry = {
      data: undefined,
      error: { data: {}, status: 500 },
      requestId: '123',
      status: 'rejected',
      isError: true,
      isSuccess: false,
    } as DaVinciCacheEntry;
    const dispatch = vi.fn();
    const mockLogger: ReturnType<typeof logger> = {
      changeLevel: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    handleResponse(cacheEntry, dispatch, 500, mockLogger);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Response of 5XX indicates unrecoverable failure',
    );
  });
});
