/*
 * @forgerock/ping-javascript-sdk
 *
 * interfaces.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export type Category =
  | 'fontNames'
  | 'displayProps'
  | 'browserProps'
  | 'hardwareProps'
  | 'platformProps';

export interface CollectParameters {
  location: boolean;
  metadata: boolean;
}

export interface DeviceProfileData {
  identifier: string;
  metadata?: {
    hardware: {
      display: {
        [key: string]: string | number | null;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
    browser: {
      [key: string]: string | number | null;
    };
    platform: {
      [key: string]: string | number | null;
    };
  };
  location?: Geolocation | Record<string, unknown>;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface BaseProfileConfig {
  fontNames: string[];
  devicePlatforms: {
    mac: string[];
    windows: string[];
    ios: string[];
  };
  displayProps: string[];
  browserProps: string[];
  hardwareProps: string[];
  platformProps: string[];
}

export interface ProfileConfigOptions {
  [key: string]: string[];
}
