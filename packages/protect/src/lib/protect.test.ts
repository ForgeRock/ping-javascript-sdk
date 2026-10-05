/*
 *
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { protect } from './protect.js';

import type { Protect, ProtectConfig } from './protect.types.js';

const config: ProtectConfig = {
  envId: '12345',
  deviceAttributesToIgnore: ['userAgent'],
  behavioralDataCollection: true,
  disableTags: false,
  disableHub: false,
  universalDeviceIdentification: false,
};

// Mock the SDK module
const mockSdk = {
  init: vi.fn().mockResolvedValue(undefined),
  getData: vi.fn().mockResolvedValue('mocked-data'),
  pauseBehavioralData: vi.fn(),
  resumeBehavioralData: vi.fn(),
};

vi.mock('@ping-identity/pingone-signals-web-sdk', () => ({
  default: mockSdk,
}));

describe('protect (with successfully loaded signals sdk)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockSdk.init.mockResolvedValue(undefined);
    mockSdk.getData.mockResolvedValue('mocked-data');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockSdk.pauseBehavioralData.mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockSdk.resumeBehavioralData.mockImplementation(() => {});
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
    it('should call start with a signalsInitializationOptions pass-through config', async () => {
      const passthroughConfig = {
        envId: '12345',
        behavioralDataCollection: 'true',
        customOption: 'value1',
      };
      const protectApi = protect(passthroughConfig);
      await protectApi.start();
      expect(mockSdk.init).toHaveBeenCalledWith(passthroughConfig);
    });

    it('should resume behavioralData when behavioralDataCollection is string "true"', async () => {
      const protectApi = protect({ envId: '12345', behavioralDataCollection: 'true' });
      await protectApi.start();
      expect(mockSdk.resumeBehavioralData).toHaveBeenCalled();
    });

    it('should not resume behavioralData when behavioralDataCollection is string "false"', async () => {
      const protectApi = protect({ envId: '12345', behavioralDataCollection: 'false' });
      await protectApi.start();
      expect(mockSdk.resumeBehavioralData).not.toHaveBeenCalled();
    });

    it('should call start', async () => {
      const protectApi = protect(config);
      const protectMock = vi.spyOn(protectApi, 'start');
      await protectApi.start();
      expect(protectMock).toHaveBeenCalled();
      expect(mockSdk.init).toHaveBeenCalledWith(config);
    });

    it('should call getData', async () => {
      const protectApi = protect(config);
      await protectApi.start();
      const protectMock = vi.spyOn(protectApi, 'getData');
      await protectApi.getData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('should call pauseBehavioralData', async () => {
      const protectApi = protect(config);
      await protectApi.start();
      const protectMock = vi.spyOn(protectApi, 'pauseBehavioralData');
      protectApi.pauseBehavioralData();
      expect(protectMock).toHaveBeenCalled();
    });

    it('should call resumeBehavioralData', async () => {
      const protectApi = protect(config);
      await protectApi.start();
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

describe('protect error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSdk.init.mockResolvedValue(undefined);
    mockSdk.getData.mockResolvedValue('mocked-data');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockSdk.pauseBehavioralData.mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockSdk.resumeBehavioralData.mockImplementation(() => {});
  });

  it('start should return error when init fails', async () => {
    mockSdk.init.mockRejectedValue(new Error('Init failed'));
    const protectApi = protect(config);
    const error = await protectApi.start();
    expect(error).toEqual({ error: 'Failed to initialize PingOne Signals SDK' });
  });

  it('getData should return error when SDK throws', async () => {
    mockSdk.init.mockResolvedValue(undefined);
    mockSdk.getData.mockRejectedValue(new Error('getData failed'));
    const protectApi = protect(config);
    await protectApi.start();
    const error = await protectApi.getData();
    expect(error).toEqual({ error: 'Failed to get data from Protect' });
  });

  it('pauseBehavioralData should return error when SDK throws', async () => {
    mockSdk.init.mockResolvedValue(undefined);
    mockSdk.pauseBehavioralData.mockImplementation(() => {
      throw new Error('pause failed');
    });
    const protectApi = protect(config);
    await protectApi.start();
    const error = protectApi.pauseBehavioralData();
    expect(error).toEqual({ error: 'Failed to pause behavioral data in Protect' });
  });

  it('resumeBehavioralData should return error when SDK throws', async () => {
    mockSdk.init.mockResolvedValue(undefined);
    mockSdk.resumeBehavioralData.mockImplementation(() => {
      throw new Error('resume failed');
    });
    const protectApi = protect(config);
    await protectApi.start();
    const error = protectApi.resumeBehavioralData();
    expect(error).toEqual({ error: 'Failed to resume behavioral data in Protect' });
  });
});
