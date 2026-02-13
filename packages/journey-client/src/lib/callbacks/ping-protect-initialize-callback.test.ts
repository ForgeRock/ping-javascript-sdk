/*
 * @forgerock/ping-javascript-sdk
 *
 * ping-protect-intitialize-callback.test.ts
 *
 * Copyright (c) 2024 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { vi, describe, expect, it } from 'vitest';

import { PingOneProtectInitializeCallback } from './ping-protect-initialize-callback.js';

describe('PingOneProtectInitializeCallback', () => {
  it('should exist', () => {
    expect(PingOneProtectInitializeCallback).toBeDefined();
  });
  it('should test the getConfig method', () => {
    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [
        {
          name: 'IDToken1signals',
          value: '',
        },
        {
          name: 'IDToken1clientError',
          value: '',
        },
      ],
      output: [
        {
          name: 'agentIdentification',
          value: true,
        },
        {
          name: 'agentTimeout',
          value: 1,
        },
        {
          name: 'agentPort',
          value: 1,
        },
        {
          name: 'behavioralDataCollection',
          value: true,
        },
        {
          name: 'disableTags',
          value: false,
        },
        {
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
        {
          name: 'universalDeviceIdentification',
          value: false,
        },
      ],
    });
    const mock = vi.spyOn(callback, 'getConfig');
    const config = callback.getConfig();
    expect(mock).toHaveBeenCalled();
    expect(config).toMatchObject({
      agentIdentification: true,
      agentTimeout: 1,
      agentPort: 1,
      envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
      behavioralDataCollection: true,
      disableTags: false,
      universalDeviceIdentification: false,
    });
  });
  it('should test the setClientError method', () => {
    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [
        {
          name: 'IDToken1signals',
          value: '',
        },
        {
          name: 'IDToken1clientError',
          value: '',
        },
      ],
      output: [
        {
          name: 'agentIdentification',
          value: false,
        },
        {
          name: 'agentTimeout',
          value: 0,
        },
        {
          name: 'agentPort',
          value: 0,
        },
        {
          name: 'behavioralDataCollection',
          value: true,
        },
        {
          name: 'disableTags',
          value: false,
        },
        {
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
        {
          name: 'universalDeviceIdentification',
          value: false,
        },
      ],
    });
    const mock = vi.spyOn(callback, 'setClientError');
    callback.setClientError('Error I set');
    expect(mock).toHaveBeenCalled();
    expect(callback.getInputValue('IDToken1clientError')).toBe('Error I set');
  });
});
