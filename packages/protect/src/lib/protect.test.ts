/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import FRStep from '@forgerock/javascript-sdk/src/fr-auth/fr-step';
import { protect } from './protect.js';
import {
  noProtectType,
  standardPingProtectEvaluationStep,
  standardPingProtectInitializeStep,
} from './protect.mock.data.js';
import { ProtectConfig, Protect } from './protect.types.js';
import { CallbackType, HiddenValueCallback } from '@forgerock/javascript-sdk';

const config: ProtectConfig = {
  envId: '12345',
  consoleLogEnabled: true,
  deviceAttributesToIgnore: ['userAgent'],
  lazyMetadata: false,
  behavioralDataCollection: true,
  deviceKeyRsyncIntervals: 14,
  enableTrust: false,
  disableTags: false,
  disableHub: false,
};

describe('protect (success tests)', () => {
  beforeAll(() => {
    vi.doMock('./signals-sdk.js', () => {
      return {
        default: {
          init: vi.fn(),
          getData: vi.fn(),
          pauseBehavioralData: vi.fn(),
          resumeBehavioralData: vi.fn(),
        },
      };
    });

    if (typeof window === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.window = {} as any;
    }

    window._pingOneSignals = {
      init: vi.fn().mockResolvedValue(undefined),
      getData: vi.fn().mockResolvedValue('mocked-data'),
      pauseBehavioralData: vi.fn(),
      resumeBehavioralData: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.doUnmock('./signals-sdk.js');
  });

  it('should be defined', () => {
    expect(protect).toBeDefined();
  });

  it('should return protect methods', async () => {
    const protectAPI = await protect(config);
    expect(protectAPI).toBeDefined();
    assertType<Protect>(protectAPI);
    expect(protectAPI.start).toBeDefined();
    expect(protectAPI.getData).toBeDefined();
    expect(protectAPI.pauseBehavioralData).toBeDefined();
    expect(protectAPI.resumeBehavioralData).toBeDefined();
    expect(protectAPI.getPauseBehavioralData).toBeDefined();
    expect(protectAPI.getNodeConfig).toBeDefined();
    expect(protectAPI.getProtectType).toBeDefined();
    expect(protectAPI.setNodeClientError).toBeDefined();
    expect(protectAPI.setNodeInputValue).toBeDefined();
  });

  describe('native node methods', () => {
    it('should call start', async () => {
      const protectAPI = await protect(config);
      const protectMock = vi.spyOn(protectAPI, 'start');
      await protectAPI.start();
      expect(protectMock).toHaveBeenCalled();
      expect(window._pingOneSignals.init).toHaveBeenCalledWith(config);
    });

    it('should call getData', async () => {
      const protectAPI = await protect(config);
      const protectMock = vi.spyOn(protectAPI, 'getData');
      await protectAPI.getData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('should call pauseBehavioralData', async () => {
      const protectAPI = await protect(config);
      const protectMock = vi.spyOn(protectAPI, 'pauseBehavioralData');
      protectAPI.pauseBehavioralData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('should call resume behavioralData', async () => {
      const protectAPI = await protect(config);
      const protectMock = vi.spyOn(protectAPI, 'resumeBehavioralData');
      protectAPI.resumeBehavioralData();
      expect(protectMock).toHaveBeenCalled();
    });
  });

  describe('marketplace node methods', () => {
    it('should test getPauseBehavioralData with marketplace data', async () => {
      const protectAPI = await protect(config);
      const result = protectAPI.getPauseBehavioralData(standardPingProtectEvaluationStep);
      expect(result).toEqual(false);

      const secondResult = protectAPI.getPauseBehavioralData(standardPingProtectInitializeStep);
      expect(secondResult).toEqual(true);
    });

    it('should get the node config', async () => {
      const protectAPI = await protect(config);
      const result = protectAPI.getNodeConfig(standardPingProtectInitializeStep);
      expect(result).toEqual(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        standardPingProtectInitializeStep!.payload.callbacks![0].output[0].value,
      );

      const result2 = protectAPI.getNodeConfig(noProtectType);
      expect(result2).toBeUndefined();
    });

    it('should test the getPingProtectType method', async () => {
      const protectAPI = await protect(config);
      const result = protectAPI.getProtectType(standardPingProtectInitializeStep);
      expect(result).toEqual('initialize');

      const result2 = protectAPI.getProtectType(standardPingProtectEvaluationStep);
      expect(result2).toEqual('evaluate');

      const result3 = protectAPI.getProtectType(noProtectType);
      expect(result3).toEqual('none');
    });

    it('should set the input with marketplace nodes', async () => {
      const protectAPI = await protect(config);
      const step = standardPingProtectEvaluationStep as FRStep;

      protectAPI.setNodeInputValue(step, 'the value');
      const [hc] = step.getCallbacksOfType<HiddenValueCallback>(CallbackType.HiddenValueCallback);

      expect(hc.getInputValue()).toEqual('the value');
    });

    it('should set an error with marketplace nodes', async () => {
      const protectAPI = await protect(config);
      protectAPI.setNodeClientError(standardPingProtectEvaluationStep, 'we errored!');

      const [, err] = (
        standardPingProtectEvaluationStep as FRStep
      ).getCallbacksOfType<HiddenValueCallback>(CallbackType.HiddenValueCallback);

      expect(err.getInputValue()).toBe('we errored!');
    });
  });
});

describe('protect (error tests)', () => {
  it('should error on failed signals sdk load', async () => {
    await expect(protect(config)).rejects.toThrowError('Failed to load PingOne Signals SDK');
  });
});
