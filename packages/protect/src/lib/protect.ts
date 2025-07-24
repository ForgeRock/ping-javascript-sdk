/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import {
  CallbackType,
  FRStep,
  HiddenValueCallback,
  MetadataCallback,
  PingOneProtectEvaluationCallback,
  PingOneProtectInitializeCallback,
} from '@forgerock/javascript-sdk';
import {
  Protect,
  ProtectConfig,
  ProtectEvaluationConfig,
  ProtectInitializeConfig,
  ProtectType,
} from './protect.types.js';

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
    start: async (): Promise<void | { error: unknown }> => {
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

      await window._pingOneSignals.init(options);

      if (options.behavioralDataCollection === true) {
        window._pingOneSignals.resumeBehavioralData();
      }
    },
    getData: async (): Promise<string | { error: unknown }> => {
      if (!protectApiInitialized) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }
      return await window._pingOneSignals.getData();
    },
    pauseBehavioralData: (): void | { error: unknown } => {
      if (!protectApiInitialized) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }
      window._pingOneSignals.pauseBehavioralData();
    },
    resumeBehavioralData: (): void | { error: unknown } => {
      if (!protectApiInitialized) {
        return { error: 'PingOne Signals SDK is not initialized' };
      }
      window._pingOneSignals.resumeBehavioralData();
    },

    /** ***********************************************************************************************
     * The following methods are required when using the Ping Protect Marketplace nodes, which has
     * generic callbacks, but can be used for native nodes and/or either callback type.
     *
     * TODO: Marketplace node verfication with these methods has not yet been completed
     */

    getPauseBehavioralData: (step: FRStep): boolean => {
      // Check for native callback first
      try {
        const nativeCallback = step.getCallbackOfType<PingOneProtectEvaluationCallback>(
          CallbackType.PingOneProtectEvaluationCallback,
        );

        const shouldPause = nativeCallback?.getPauseBehavioralData();
        return shouldPause || false;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Do nothing
      }

      // If we are here, we are dealing with Marketplace nodes
      const cbs = step.getCallbacksOfType<MetadataCallback>(CallbackType.MetadataCallback);

      if (!cbs.length) {
        return false;
      }

      const protectMetadataCb = cbs.find((metadataCallback: MetadataCallback) => {
        const data = metadataCallback.getData() as { _type: string; _action: string };
        return data._type === 'PingOneProtect';
      });

      if (!protectMetadataCb) {
        return false;
      }

      const data: ProtectInitializeConfig | ProtectEvaluationConfig = (
        protectMetadataCb as MetadataCallback
      ).getData();

      if (data._action === 'protect_risk_evaluation') {
        return false;
      } else {
        return !!(data as ProtectInitializeConfig).behavioralDataCollection;
      }
    },
    getNodeConfig: (step: FRStep): ProtectInitializeConfig | undefined => {
      // Check for native callback first
      try {
        const nativeCallback = step.getCallbackOfType<PingOneProtectInitializeCallback>(
          CallbackType.PingOneProtectInitializeCallback,
        );

        const config = nativeCallback?.getConfig() as ProtectInitializeConfig;
        return config;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Do nothing
      }

      const cbs = step.getCallbacksOfType<MetadataCallback>(CallbackType.MetadataCallback);

      if (!cbs.length) {
        return undefined;
      }

      const protectMetadataCb = cbs.find((metadataCallback) => {
        const data = metadataCallback.getData() as { _type: string; _action: string };
        return data._action === 'protect_initialize';
      });

      if (!protectMetadataCb) {
        return undefined;
      }

      const data = (protectMetadataCb as MetadataCallback).getData() as ProtectInitializeConfig;

      return data;
    },
    getProtectType: (step: FRStep): ProtectType => {
      const cbs = step.getCallbacksOfType(CallbackType.MetadataCallback);

      if (!cbs.length) {
        return 'none';
      }

      const protectMetadataCb = cbs.find((cb) => {
        const metadataCallback = cb as MetadataCallback;
        const data = metadataCallback.getData() as { _type: string; _action: string };
        return data._type === 'PingOneProtect';
      });

      if (!protectMetadataCb) {
        return 'none';
      }

      const data = (protectMetadataCb as MetadataCallback).getData() as ProtectInitializeConfig;

      return data._action === 'protect_initialize' ? 'initialize' : 'evaluate';
    },
    setNodeClientError: (step: FRStep, value: string): void => {
      // Check for native callback first
      const nativeEvaluationCallback = step.getCallbacksOfType<PingOneProtectEvaluationCallback>(
        CallbackType.PingOneProtectEvaluationCallback,
      );
      const nativeInitializeCallback = step.getCallbacksOfType<PingOneProtectInitializeCallback>(
        CallbackType.PingOneProtectInitializeCallback,
      );
      const arr = [...nativeEvaluationCallback, ...nativeInitializeCallback];

      if (arr.length) {
        const cb = arr[0];
        cb.setClientError(value);
        return;
      }

      // If we are here, we are dealing with Marketplace nodes
      const cbs = step.getCallbacksOfType<HiddenValueCallback>(CallbackType.HiddenValueCallback);

      if (!cbs.length) {
        return;
      }

      const clientErrorCb = cbs.find((hiddenValueCallback) => {
        const output = hiddenValueCallback.getOutputByName<string>('id', '');
        return output === 'clientError';
      });

      if (!clientErrorCb) {
        return;
      }

      clientErrorCb.setInputValue(value);
    },
    setNodeInputValue: (step: FRStep, value: string): void => {
      // Check for native callback first
      try {
        const nativeCallback = step.getCallbackOfType<PingOneProtectEvaluationCallback>(
          CallbackType.PingOneProtectEvaluationCallback,
        );

        nativeCallback?.setData(value);
        return;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Do nothing
      }

      // If we are here, we are dealing with Marketplace nodes
      const cbs = step.getCallbacksOfType<HiddenValueCallback>(CallbackType.HiddenValueCallback);

      if (!cbs.length) {
        return;
      }

      const inputCb = cbs.find((hiddenValueCallback) => {
        const output = hiddenValueCallback.getOutputByName<string>('id', '');
        return output === 'pingone_risk_evaluation_signals';
      });

      if (!inputCb) {
        return;
      }

      inputCb.setInputValue(value);
    },
  };
}
