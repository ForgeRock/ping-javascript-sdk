/*
 * @forgerock/ping-javascript-sdk
 *
 * ping-protect-intitialize-callback.test.ts
 *
 * Copyright (c) 2024 - 2026 Ping Identity Corporation. All rights reserved.
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
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
        {
          name: 'consoleLogEnabled',
          value: false,
        },
        {
          name: 'deviceAttributesToIgnore',
          value: [],
        },
        {
          name: 'customHost',
          value: '',
        },
        {
          name: 'lazyMetadata',
          value: false,
        },
        {
          name: 'behavioralDataCollection',
          value: true,
        },
        {
          name: 'deviceKeyRsyncIntervals',
          value: 14,
        },
        {
          name: 'enableTrust',
          value: false,
        },
        {
          name: 'disableTags',
          value: false,
        },
        {
          name: 'disableHub',
          value: false,
        },
      ],
    });
    const mock = vi.spyOn(callback, 'getConfig');
    const config = callback.getConfig();
    expect(mock).toHaveBeenCalled();
    expect(config).toMatchObject({
      envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
      consoleLogEnabled: false,
      deviceAttributesToIgnore: [],
      customHost: '',
      lazyMetadata: false,
      behavioralDataCollection: true,
      deviceKeyRsyncIntervals: 14,
      enableTrust: false,
      disableTags: false,
      disableHub: false,
    });
  });
  it('should return signalsInitializationOptions directly when it is a valid plain object', () => {
    const signalsInitializationOptions = {
      agentIdentification: 'false',
      htmlGeoLocation: 'true',
      behavioralDataCollection: 'true',
      universalDeviceIdentification: 'false',
      option1: 'value1',
      disableTags: 'false',
    };

    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [],
      output: [
        {
          name: 'signalsInitializationOptions',
          value: signalsInitializationOptions,
        },
        {
          name: 'envId',
          value: 'legacy-env-id-that-should-be-ignored',
        },
      ],
    });

    const config = callback.getConfig();
    expect(config).toEqual(signalsInitializationOptions);
    expect(config).not.toHaveProperty('envId');
  });

  it('should fallback to legacy config when signalsInitializationOptions is an array (invalid)', () => {
    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [],
      output: [
        {
          name: 'signalsInitializationOptions',
          value: [],
        },
        {
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
      ],
    });

    const config = callback.getConfig();
    expect(config).toMatchObject({
      envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
      behavioralDataCollection: true,
      disableTags: false,
    });
  });

  it('should fallback to legacy config when signalsInitializationOptions is null (invalid)', () => {
    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [],
      output: [
        {
          name: 'signalsInitializationOptions',
          value: null,
        },
        {
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
      ],
    });

    const config = callback.getConfig();
    expect(config).toMatchObject({
      envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
      behavioralDataCollection: true,
      disableTags: false,
    });
  });

  it('should fallback to legacy config when signalsInitializationOptions is a string (invalid)', () => {
    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [],
      output: [
        {
          name: 'signalsInitializationOptions',
          value: 'somestring',
        },
        {
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
      ],
    });

    const config = callback.getConfig();
    expect(config).toMatchObject({
      envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
      behavioralDataCollection: true,
      disableTags: false,
    });
  });

  it('should fallback to legacy config when signalsInitializationOptions is missing', () => {
    const callback = new PingOneProtectInitializeCallback({
      type: callbackType.PingOneProtectInitializeCallback,
      input: [],
      output: [
        {
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
      ],
    });

    const config = callback.getConfig();
    expect(config).toMatchObject({
      envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
      behavioralDataCollection: true,
      disableTags: false,
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
          name: 'envId',
          value: '02fb4743-189a-4bc7-9d6c-a919edfe6447',
        },
        {
          name: 'consoleLogEnabled',
          value: false,
        },
        {
          name: 'deviceAttributesToIgnore',
          value: [],
        },
        {
          name: 'customHost',
          value: '',
        },
        {
          name: 'lazyMetadata',
          value: false,
        },
        {
          name: 'behavioralDataCollection',
          value: true,
        },
        {
          name: 'deviceKeyRsyncIntervals',
          value: 14,
        },
        {
          name: 'enableTrust',
          value: false,
        },
        {
          name: 'disableTags',
          value: false,
        },
        {
          name: 'disableHub',
          value: false,
        },
      ],
    });
    const mock = vi.spyOn(callback, 'setClientError');
    callback.setClientError('error i just set');
    expect(mock).toHaveBeenCalled();
    expect(callback.getInputValue('IDToken1clientError')).toBe('error i just set');
  });
});
