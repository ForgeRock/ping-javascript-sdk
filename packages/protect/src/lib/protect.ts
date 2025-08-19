/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { Protect, ProtectConfig } from './protect.types.js';

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
 * @function protect - returns a set of methods to interact with the PingOne Signals SDK
 * @param {ProtectConfig} options - the configuration options for the PingOne Signals SDK
 * @returns {Promise<Protect>} - a set of methods to interact with the PingOne Signals SDK
 */
export function protect(options: ProtectConfig): Protect {
  let protectApiInitialized = false;

  return {
    start: async (): Promise<void | { error: string }> => {
      try {
        /*
         * Load the Ping Signals SDK
         * this automatically pollutes the window
         * there are no exports of this module
         */
        await import('./signals-sdk.js' as string);
        protectApiInitialized = true;
      } catch (err) {
        console.error('error loading ping signals', err);
        return { error: 'Failed to load PingOne Signals SDK' };
      }

      try {
        await window._pingOneSignals.init(options);

        if (options.behavioralDataCollection === true) {
          window._pingOneSignals.resumeBehavioralData();
        }
      } catch (err) {
        console.error('error initializing ping protect', err);
        return { error: 'Failed to initialize PingOne Signals SDK' };
      }
    },
    getData: async (): Promise<string | { error: string }> => {
      if (!protectApiInitialized) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }

      try {
        return await window._pingOneSignals.getData();
      } catch (err) {
        console.error('error getting data from ping protect', err);
        return { error: 'Failed to get data from Protect' };
      }
    },
    pauseBehavioralData: (): void | { error: string } => {
      if (!protectApiInitialized) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }

      try {
        window._pingOneSignals.pauseBehavioralData();
      } catch (err) {
        console.error('error pausing behavioral data in ping protect', err);
        return { error: 'Failed to pause behavioral data in Protect' };
      }
    },
    resumeBehavioralData: (): void | { error: string } => {
      if (!protectApiInitialized) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }

      try {
        window._pingOneSignals.resumeBehavioralData();
      } catch (err) {
        console.error('error resuming behavioral data in ping protect', err);
        return { error: 'Failed to resume behavioral data in Protect' };
      }
    },
  };
}
