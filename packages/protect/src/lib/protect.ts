/*
 *
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { PingOneSignals } from '@ping-identity/pingone-signals-web-sdk';

import type { Protect, ProtectConfig, SignalsInitializationOptions } from './protect.types.js';

/**
 * @async
 * @function protect - returns a set of methods to interact with the PingOne Signals SDK
 * @param {ProtectConfig | SignalsInitializationOptions} options - the configuration options for the PingOne Signals SDK
 * @returns {Promise<Protect>} - a set of methods to interact with the PingOne Signals SDK
 */
export function protect(options: ProtectConfig | SignalsInitializationOptions): Protect {
  let protectApiInitialized = false;
  let sdk: PingOneSignals | null = null;

  return {
    start: async (): Promise<void | { error: string }> => {
      try {
        /*
         * Load the PingOne Signals SDK
         * The SDK attaches itself to window._pingOneSignals and also exports a default
         */
        const signalsModule = await import('@ping-identity/pingone-signals-web-sdk');
        sdk = signalsModule.default as PingOneSignals;
        protectApiInitialized = true;
      } catch (err) {
        console.error('error loading ping signals', err);
        return { error: 'Failed to load PingOne Signals SDK' };
      }

      try {
        await sdk?.init(options);

        if (
          options.behavioralDataCollection === true ||
          options.behavioralDataCollection === 'true'
        ) {
          sdk?.resumeBehavioralData();
        }
      } catch (err) {
        console.error('error initializing ping protect', err);
        return { error: 'Failed to initialize PingOne Signals SDK' };
      }
    },
    getData: async (): Promise<string | { error: string }> => {
      if (!protectApiInitialized || !sdk) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }

      try {
        // SDK returns string despite typed as SignalsData
        return (await sdk.getData()) as unknown as string;
      } catch (err) {
        console.error('error getting data from ping protect', err);
        return { error: 'Failed to get data from Protect' };
      }
    },
    pauseBehavioralData: (): void | { error: string } => {
      if (!protectApiInitialized || !sdk) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }

      try {
        sdk.pauseBehavioralData();
      } catch (err) {
        console.error('error pausing behavioral data in ping protect', err);
        return { error: 'Failed to pause behavioral data in Protect' };
      }
    },
    resumeBehavioralData: (): void | { error: string } => {
      if (!protectApiInitialized || !sdk) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }

      try {
        sdk.resumeBehavioralData();
      } catch (err) {
        console.error('error resuming behavioral data in ping protect', err);
        return { error: 'Failed to resume behavioral data in Protect' };
      }
    },
  };
}
