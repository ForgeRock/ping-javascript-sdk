/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { createProtect } from './protect.js';
import { ProtectConfig, Protect } from './protect.types.js';

describe('createProtect', () => {
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

  async function getProtect(options: ProtectConfig): Promise<Protect> {
    const protect: Protect = await createProtect(options);
    expect(protect).toBeDefined();
    assertType<Protect>(protect);
    return protect;
  }

  beforeEach(() => {
    vi.mock('./signals-sdk.js', () => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any)._pingOneSignals;
  });

  it('should be defined', () => {
    expect(createProtect).toBeDefined();
  });

  it('should return protect methods', async () => {
    const protect = await getProtect(config);
    expect(protect.start).toBeDefined();
    expect(protect.getData).toBeDefined();
    expect(protect.pauseBehavioralData).toBeDefined();
    expect(protect.resumeBehavioralData).toBeDefined();
  });

  it('should call start', async () => {
    const protect = await getProtect(config);
    const protectMock = vi.spyOn(protect, 'start');
    await protect.start();
    expect(protectMock).toHaveBeenCalled();
    expect(window._pingOneSignals.init).toHaveBeenCalledWith(config);
  });

  it('should call getData', async () => {
    const protect = await getProtect(config);
    const protectMock = vi.spyOn(protect, 'getData');
    await protect.getData();
    expect(protectMock).toHaveBeenCalled();
  });

  it('should call pauseBehavioralData', async () => {
    const protect = await getProtect(config);
    const protectMock = vi.spyOn(protect, 'pauseBehavioralData');
    protect.pauseBehavioralData();
    expect(protectMock).toHaveBeenCalled();
  });

  it('should call resume behavioralData', async () => {
    const protect = await getProtect(config);
    const protectMock = vi.spyOn(protect, 'resumeBehavioralData');
    protect.resumeBehavioralData();
    expect(protectMock).toHaveBeenCalled();
  });

  it('should error on failed signals sdk load', async () => {
    vi.doUnmock('./signals-sdk.js');
    await expect(createProtect(config)).rejects.toThrowError('Failed to load PingOne Signals SDK');
  });
});
