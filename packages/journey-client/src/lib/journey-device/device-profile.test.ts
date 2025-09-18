/*
 * @forgerock/javascript-sdk
 *
 * device-profile.test.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { vi, expect, describe, it, afterEach, beforeEach, SpyInstance } from 'vitest';
import { journeyDevice } from './index.js';

Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: vi.fn().mockImplementation(() => ['714524572', '2799534390', '3707617532']),
  },
});

describe('Test DeviceProfile', () => {
  it('should return basic metadata', async () => {
    const device = journeyDevice();
    const profile = await device.getProfile({
      location: false,
      metadata: true,
    });
    if (!profile.metadata) throw new Error('Metadata is not defined');
    const userAgent = profile.metadata.browser.userAgent as string;
    const appName = profile.metadata.browser.appName as string;
    const appVersion = profile.metadata.browser.appVersion as string;
    const vendor = profile.metadata.browser.vendor as string;
    const display = profile.metadata.hardware.display;
    const deviceName = profile.metadata.platform.deviceName as string;
    expect(userAgent.includes('jsdom')).toBeTruthy();
    expect(appName).toBe('Netscape');
    expect(appVersion).toBe('4.0');
    expect(vendor).toBe('Apple Computer, Inc.');
    expect(display).toHaveProperty('width');
    expect(display).toHaveProperty('height');
    expect(deviceName.length).toBeGreaterThan(1);
  });

  it('should return metadata without any display props', async () => {
    const device = journeyDevice({ displayProps: [] });
    const profile = await device.getProfile({
      location: false,
      metadata: true,
    });
    if (!profile.metadata) throw new Error('Metadata is not defined');
    const userAgent = profile.metadata.browser.userAgent as string;
    const display = profile.metadata.hardware.display;
    const deviceName = profile.metadata.platform.deviceName as string;
    expect(userAgent.length).toBeGreaterThan(1);
    expect(display.width).toBeFalsy();
    expect(display.height).toBeFalsy();
    expect(deviceName.length).toBeGreaterThan(1);
  });

  it('should return metadata according to narrowed browser props', async () => {
    const device = journeyDevice({ browserProps: ['userAgent'] });
    const profile = await device.getProfile({
      location: false,
      metadata: true,
    });
    if (!profile.metadata) throw new Error('Metadata is not defined');
    const userAgent = profile.metadata.browser.userAgent as string;
    const appName = profile.metadata.browser.appName as string;
    const appVersion = profile.metadata.browser.appVersion as string;
    const vendor = profile.metadata.browser.vendor as string;
    const display = profile.metadata.hardware.display;
    const deviceName = profile.metadata.platform.deviceName as string;
    expect(userAgent.includes('jsdom')).toBeTruthy();
    expect(appName).toBeFalsy();
    expect(appVersion).toBeFalsy();
    expect(vendor).toBeFalsy();
    expect(display).toHaveProperty('width');
    expect(display).toHaveProperty('height');
    expect(deviceName.length).toBeGreaterThan(1);
  });

  describe('logLevel tests', () => {
    let warnSpy: SpyInstance;
    const originalNavigator = global.navigator;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete global.navigator;
    });

    afterEach(() => {
      warnSpy.mockRestore();
      global.navigator = originalNavigator;
    });

    it('should not log warnings if logLevel is "error"', () => {
      const device = journeyDevice(undefined, 'error');
      device.getBrowserMeta();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should log warnings if logLevel is "warn"', () => {
      const device = journeyDevice(undefined, 'warn');
      device.getBrowserMeta();
      expect(warnSpy).toHaveBeenCalledWith(
        'Cannot collect browser metadata. navigator is not defined.',
      );
    });
  });

  it('should use custom prefix for device identifier', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const device = journeyDevice(undefined, 'info', 'my-custom-prefix');
    device.getIdentifier();

    expect(setItemSpy).toHaveBeenCalledWith('my-custom-prefix-DeviceID', expect.any(String));

    setItemSpy.mockRestore();
  });
});
