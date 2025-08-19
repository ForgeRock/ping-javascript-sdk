/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { protect } from './protect.js';
import { ProtectConfig, Protect } from './protect.types.js';

const config: ProtectConfig = {
  envId: '12345',
  deviceAttributesToIgnore: ['userAgent'],
  behavioralDataCollection: true,
  disableTags: false,
  disableHub: false,
  universalDeviceIdentification: false,
};

describe('protect (with successfully loaded signals sdk)', () => {
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

  it('should return protect methods', () => {
    const protectApi = protect(config);
    expect(protectApi).toBeDefined();
    assertType<Protect>(protectApi);
    expect(protectApi.start).toBeDefined();
    expect(protectApi.getData).toBeDefined();
    expect(protectApi.pauseBehavioralData).toBeDefined();
    expect(protectApi.resumeBehavioralData).toBeDefined();
  });

  describe('native node methods', () => {
    it('should call start', async () => {
      const protectApi = protect(config);
      const protectMock = vi.spyOn(protectApi, 'start');
      await protectApi.start();
      expect(protectMock).toHaveBeenCalled();
      expect(window._pingOneSignals.init).toHaveBeenCalledWith(config);
    });

    it('should call getData', async () => {
      const protectApi = protect(config);
      const protectMock = vi.spyOn(protectApi, 'getData');
      await protectApi.getData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('should call pauseBehavioralData', () => {
      const protectApi = protect(config);
      const protectMock = vi.spyOn(protectApi, 'pauseBehavioralData');
      protectApi.pauseBehavioralData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('should call resumeBehavioralData', () => {
      const protectApi = protect(config);
      const protectMock = vi.spyOn(protectApi, 'resumeBehavioralData');
      protectApi.resumeBehavioralData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('getData should error if start has not been called', async () => {
      const protectApi = protect(config);
      const error = await protectApi.getData();
      expect(error).toEqual({ error: 'PingOne Signals SDK is not initialized' });
    });

    it('pauseBehavioralData should error if start has not been called', async () => {
      const protectApi = protect(config);
      const error = await protectApi.pauseBehavioralData();
      expect(error).toEqual({ error: 'PingOne Signals SDK is not initialized' });
    });

    it('resumeBehavioralData should error if start has not been called', async () => {
      const protectApi = protect(config);
      const error = await protectApi.resumeBehavioralData();
      expect(error).toEqual({ error: 'PingOne Signals SDK is not initialized' });
    });
  });
});

describe('protect (with failed signals sdk load)', () => {
  beforeAll(() => {
    vi.doMock('./signals-sdk.js', () => {
      throw new Error('Failed to load PingOne Signals SDK');
    });
  });

  afterAll(() => {
    vi.doUnmock('./signals-sdk.js');
  });

  it('start method should error', async () => {
    const protectApi = protect(config);
    const error = await protectApi.start();
    await expect(error).toEqual({ error: 'Failed to load PingOne Signals SDK' });
  });

  it('getData method should error', async () => {
    const protectApi = protect(config);
    await protectApi.start();
    const error = await protectApi.getData();
    await expect(error).toEqual({ error: 'PingOne Signals SDK is not initialized' });
  });

  it('pauseBehavioralData method should error', async () => {
    const protectApi = protect(config);
    await protectApi.start();
    const error = await protectApi.pauseBehavioralData();
    await expect(error).toEqual({ error: 'PingOne Signals SDK is not initialized' });
  });

  it('resumeBehavioralData method should error', async () => {
    const protectApi = protect(config);
    await protectApi.start();
    const error = await protectApi.resumeBehavioralData();
    await expect(error).toEqual({ error: 'PingOne Signals SDK is not initialized' });
  });
});
