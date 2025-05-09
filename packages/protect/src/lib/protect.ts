/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { ProtectConfig, Protect } from './protect.types.js';

// Add Signals SDK namespace to the window object
declare global {
  interface Window {
    _pingOneSignals: {
      init: (initParams?: ProtectConfig) => Promise<void>;
      getData: () => Promise<string>;
      pauseBehavioralData: () => void;
      resumeBehavioralData: () => void;
    };
  }
}

/**
 * @async
 * @function createProtect - returns a set of methods to interact with the PingOne Signals SDK
 * @param {ProtectConfig} options - the configuration options for the PingOne Signals SDK
 * @returns {Promise<Protect>} - a set of methods to interact with the PingOne Signals SDK
 */
export async function createProtect(options: ProtectConfig): Promise<Protect> {
  const protectAPI: Protect = {
    start: async function start(): Promise<void> {
      await window._pingOneSignals.init(options);

      if (options.behavioralDataCollection === true) {
        window._pingOneSignals.resumeBehavioralData();
      }
    },

    getData: async function getData(): Promise<string> {
      return await window._pingOneSignals.getData();
    },

    pauseBehavioralData: function pauseBehavioralData(): void {
      window._pingOneSignals.pauseBehavioralData();
    },

    resumeBehavioralData: function resumeBehavioralData(): void {
      window._pingOneSignals.resumeBehavioralData();
    },
  };

  try {
    /*
     * Load the Ping Signals SDK
     * this automatically pollutes the window
     * there are no exports of this module
     */
    await import('./signals-sdk.js' as string);
    return protectAPI;
  } catch (err) {
    console.error('error loading ping signals', err);
    throw new Error('Failed to load PingOne Signals SDK');
  }
}
