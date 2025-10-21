/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { JourneyCallback } from './index.js';

import type { DeviceProfileData } from '../journey-device/interfaces.js';

/**
 * Represents a callback used to collect device profile data.
 */
export class DeviceProfileCallback extends JourneyCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the callback's data.
   */
  public getMessage(): string {
    return this.getOutputByName<string>('message', '');
  }

  /**
   * Does callback require metadata?
   */
  public isMetadataRequired(): boolean {
    return this.getOutputByName<boolean>('metadata', false);
  }

  /**
   * Does callback require location data?
   */
  public isLocationRequired(): boolean {
    return this.getOutputByName<boolean>('location', false);
  }

  /**
   * Sets the profile.
   */
  public setProfile(profile: DeviceProfileData): void {
    this.setInputValue(JSON.stringify(profile));
  }
}
