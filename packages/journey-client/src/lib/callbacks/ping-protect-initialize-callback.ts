/*
 * Copyright (c) 2024 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { BaseCallback } from './base-callback.js';

/**
 * @class - Represents a callback used to initialize and start device and behavioral data collection.
 */
export class PingOneProtectInitializeCallback extends BaseCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Get callback's initialization config settings
   */
  public getConfig() {
    const config = {
      // Required parameter
      envId: this.getOutputByName<string>('envId', ''),

      // Optional parameters
      agentIdentification: this.getOutputByName<boolean>('agentIdentification', false),
      agentTimeout: this.getOutputByName<number>('agentTimeout', 0),
      agentPort: this.getOutputByName<number>('agentPort', 0),
      behavioralDataCollection: this.getOutputByName<boolean>('behavioralDataCollection', true),
      disableTags: this.getOutputByName<boolean>('disableTags', false),
      universalDeviceIdentification: this.getOutputByName<boolean>(
        'universalDeviceIdentification',
        false,
      ),
    };
    return config;
  }

  public setClientError(errorMessage: string): void {
    this.setInputValue(errorMessage, /clientError/);
  }
}
