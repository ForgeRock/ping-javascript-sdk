/*
 * Copyright (c) 2024 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import JourneyCallback from './index.js';
import type { Callback } from '@forgerock/sdk-types';

/**
 * @class - Represents a callback used to initialize and start device and behavioral data collection.
 */
class PingOneProtectInitializeCallback extends JourneyCallback {
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
      envId: this.getOutputByName<string>('envId', ''),
      consoleLogEnabled: this.getOutputByName<boolean>('consoleLogEnabled', false),
      deviceAttributesToIgnore: this.getOutputByName<string[]>('deviceAttributesToIgnore', []),
      customHost: this.getOutputByName<string>('customHost', ''),
      lazyMetadata: this.getOutputByName<boolean>('lazyMetadata', false),
      behavioralDataCollection: this.getOutputByName<boolean>('behavioralDataCollection', true),
      deviceKeyRsyncIntervals: this.getOutputByName<number>('deviceKeyRsyncIntervals', 14),
      enableTrust: this.getOutputByName<boolean>('enableTrust', false),
      disableTags: this.getOutputByName<boolean>('disableTags', false),
      disableHub: this.getOutputByName<boolean>('disableHub', false),
    };
    return config;
  }

  public setClientError(errorMessage: string): void {
    this.setInputValue(errorMessage, /clientError/);
  }
}

export default PingOneProtectInitializeCallback;
