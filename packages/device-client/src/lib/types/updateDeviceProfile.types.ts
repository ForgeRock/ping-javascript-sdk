/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export type DeviceMetadata = {
  platform: string;
  version: 34;
  device: string;
  deviceName: string;
  model: string;
  brand: string;
  locale: string;
  timeZone: string;
  jailBreakScore: 0;
};

export type Hardware = {
  hardware: string;
  manufacturer: string;
  storage: 5939;
  memory: 2981;
  cpu: 4;
  display: {
    width: 1440;
    height: 2678;
    orientation: 1;
  };
  camera: {
    numberOfCameras: 2;
  };
};

export type Browser = {
  userAgent: string;
};

export type Bluetooth = {
  supported: true;
};

export type Network = {
  connected: true;
};

export type Telephony = {
  networkCountryIso: 'us';
  carrierName: 'T-Mobile';
};

export type Metadata = {
  platform: DeviceMetadata;
  hardware: Hardware;
  browser: Browser;
  bluetooth: Bluetooth;
  network: Network;
  telephony: Telephony;
};

export type DeviceProfile = {
  _id: string;
  _rev: string;
  identifier: string;
  metadata: Metadata;
  lastSelectedDate: number;
  alias: 'Test3';
  recoveryCodes: [];
};
