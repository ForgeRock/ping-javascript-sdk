/*
 * @forgerock/javascript-sdk
 *
 * index.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  browserProps,
  configurableCategories,
  delay,
  devicePlatforms,
  displayProps,
  fontNames,
  hardwareProps,
  platformProps,
} from './defaults.js';
import type {
  BaseProfileConfig,
  Category,
  CollectParameters,
  DeviceProfileData,
  Geolocation,
  ProfileConfigOptions,
} from './interfaces.js';
import { reduceToObject, reduceToString } from '@forgerock/sdk-utilities';
import { logger } from '@forgerock/sdk-logger';

const FRLogger = logger({ level: 'info' });

/**
 * @class FRDevice - Collects user device metadata
 *
 * Example:
 *
 * ```js
 * // Instantiate new device object (w/optional config, if needed)
 * const device = new forgerock.FRDevice(
 *   // optional configuration
 * );
 * // override any instance methods, if needed
 * // e.g.: device.getDisplayMeta = () => {};
 *
 * // Call getProfile with required argument obj of boolean properties
 * // of location and metadata
 * const profile = await device.getProfile({
 *   location: isLocationRequired,
 *   metadata: isMetadataRequired,
 * });
 * ```
 */
class FRDevice {
  config: BaseProfileConfig = {
    fontNames,
    devicePlatforms,
    displayProps,
    browserProps,
    hardwareProps,
    platformProps,
  };

  private prefix: string;

  constructor(config?: ProfileConfigOptions, prefix = 'forgerock') {
    this.prefix = prefix;
    if (config) {
      Object.keys(config).forEach((key: string) => {
        if (!configurableCategories.includes(key)) {
          throw new Error('Device profile configuration category does not exist.');
        }
        this.config[key as Category] = config[key as Category];
      });
    }
  }

  getBrowserMeta(): Record<string, string | number | null> {
    if (typeof navigator === 'undefined') {
      FRLogger.warn('Cannot collect browser metadata. navigator is not defined.');
      return {};
    }
    return reduceToObject(
      this.config.browserProps,
      navigator as unknown as Record<string, unknown>,
    );
  }

  getBrowserPluginsNames(): string {
    if (!(typeof navigator !== 'undefined' && navigator.plugins)) {
      FRLogger.warn('Cannot collect browser plugin information. navigator.plugins is not defined.');
      return '';
    }
    return reduceToString(
      Object.keys(navigator.plugins),
      navigator.plugins as unknown as Record<string, { filename: string }>,
    );
  }

  getDeviceName(): string {
    if (typeof navigator === 'undefined') {
      FRLogger.warn('Cannot collect device name. navigator is not defined.');
      return '';
    }
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    switch (true) {
      case this.config.devicePlatforms.mac.includes(platform):
        return 'Mac (Browser)';
      case this.config.devicePlatforms.ios.includes(platform):
        return `${platform} (Browser)`;
      case this.config.devicePlatforms.windows.includes(platform):
        return 'Windows (Browser)';
      case /Android/.test(platform) || /Android/.test(userAgent):
        return 'Android (Browser)';
      case /CrOS/.test(userAgent) || /Chromebook/.test(userAgent):
        return 'Chrome OS (Browser)';
      case /Linux/.test(platform):
        return 'Linux (Browser)';
      default:
        return `${platform || 'Unknown'} (Browser)`;
    }
  }

  getDisplayMeta(): { [key: string]: string | number | null } {
    if (typeof screen === 'undefined') {
      FRLogger.warn('Cannot collect screen information. screen is not defined.');
      return {};
    }
    return reduceToObject(this.config.displayProps, screen as unknown as Record<string, unknown>);
  }

  getHardwareMeta(): Record<string, string | number | null> {
    if (typeof navigator === 'undefined') {
      FRLogger.warn('Cannot collect OS metadata. Navigator is not defined.');
      return {};
    }
    return reduceToObject(
      this.config.hardwareProps,
      navigator as unknown as Record<string, unknown>,
    );
  }

  getIdentifier(): string {
    const storageKey = `${this.prefix}-DeviceID`;

    if (!(typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues)) {
      FRLogger.warn('Cannot generate profile ID. Crypto and/or getRandomValues is not supported.');
      return '';
    }
    if (!localStorage) {
      FRLogger.warn('Cannot store profile ID. localStorage is not supported.');
      return '';
    }
    let id = localStorage.getItem(storageKey);
    if (!id) {
      // generate ID, 3 sections of random numbers: "714524572-2799534390-3707617532"
      id = globalThis.crypto.getRandomValues(new Uint32Array(3)).join('-');
      localStorage.setItem(storageKey, id);
    }
    return id;
  }

  getInstalledFonts(): string {
    if (typeof document === 'undefined') {
      FRLogger.warn('Cannot collect font data. Global document object is undefined.');
      return '';
    }
    const canvas = document.createElement('canvas');
    if (!canvas) {
      FRLogger.warn('Cannot collect font data. Browser does not support canvas element');
      return '';
    }
    const context = canvas.getContext && canvas.getContext('2d');

    if (!context) {
      FRLogger.warn('Cannot collect font data. Browser does not support 2d canvas context');
      return '';
    }
    const text = 'abcdefghi0123456789';
    context.font = '72px Comic Sans';
    const baseWidth = context.measureText(text).width;

    const installedFonts = this.config.fontNames.reduce((prev: string, curr: string) => {
      context.font = `72px ${curr}, Comic Sans`;
      const newWidth = context.measureText(text).width;

      if (newWidth !== baseWidth) {
        prev = `${prev}${curr};`;
      }
      return prev;
    }, '');

    return installedFonts;
  }

  async getLocationCoordinates(): Promise<Geolocation | Record<string, unknown>> {
    if (!(typeof navigator !== 'undefined' && navigator.geolocation)) {
      FRLogger.warn(
        'Cannot collect geolocation information. navigator.geolocation is not defined.',
      );
      return Promise.resolve({});
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => {
          FRLogger.warn('Cannot collect geolocation information. Geolocation API error.');
          resolve({});
        },
        {
          enableHighAccuracy: true,
          timeout: delay,
          maximumAge: 0,
        },
      );
    });
  }

  getOSMeta(): Record<string, string | number | null> {
    if (typeof navigator === 'undefined') {
      FRLogger.warn('Cannot collect OS metadata. navigator is not defined.');
      return {};
    }
    return reduceToObject(
      this.config.platformProps,
      navigator as unknown as Record<string, unknown>,
    );
  }

  async getProfile({ location, metadata }: CollectParameters): Promise<DeviceProfileData> {
    const profile: DeviceProfileData = {
      identifier: this.getIdentifier(),
    };

    if (metadata) {
      profile.metadata = {
        hardware: {
          ...this.getHardwareMeta(),
          display: this.getDisplayMeta(),
        },
        browser: {
          ...this.getBrowserMeta(),
          plugins: this.getBrowserPluginsNames(),
        },
        platform: {
          ...this.getOSMeta(),
          deviceName: this.getDeviceName(),
          fonts: this.getInstalledFonts(),
          timezone: this.getTimezoneOffset(),
        },
      };
    }
    if (location) {
      profile.location = await this.getLocationCoordinates();
    }
    return profile;
  }

  getTimezoneOffset(): number | null {
    try {
      return new Date().getTimezoneOffset();
    } catch {
      FRLogger.warn('Cannot collect timezone information. getTimezoneOffset is not defined.');
      return null;
    }
  }
}

export default FRDevice;
