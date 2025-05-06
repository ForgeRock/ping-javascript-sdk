/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import FRStep from '@forgerock/javascript-sdk/src/fr-auth/fr-step';

/**
 * @interface ProtectConfig - Interface for the Protect module configuration parameters
 * @description - envId is required. All other parameters are optional.
 */
export interface ProtectConfig {
  /**
   * @property {string} envId - the environment id from your PingOne tenant
   */
  envId: string;

  /**
   * @property {boolean} [consoleLogEnabled] - true to enable SDK logs in the developer console. default is false
   */
  consoleLogEnabled?: boolean;

  /**
   * @property {boolean} [waitForWindowLoad] - true to init the SDK on load event, instead of DOMContentLoaded event. default is true
   */
  waitForWindowLoad?: boolean;

  /**
   * @property {string} [hubUrl] - iframe url for cross-storage device ID
   */
  hubUrl?: string;

  /**
   * @property {boolean} [disableHub] - when true, the SDK store the deviceId to the localStorage only and won't use an iframe (hub). default is false
   */
  disableHub?: boolean;

  /**
   * @property {string[]} [deviceAttributesToIgnore] - metadata blacklist
   */
  deviceAttributesToIgnore?: string[];

  /**
   * @property {boolean} [lazyMetadata] - true to calculate the metadata only on getData invocation, otherwise do it automatically on init. default is false
   */
  lazyMetadata?: boolean;

  /**
   * @property {boolean} [behavioralDataCollection] - true to collect behavioral data. default is true
   */
  behavioralDataCollection?: boolean;

  /**
   * @property {boolean} [disableTags] - true to skip tag collection. default is false
   */
  disableTags?: boolean;

  /**
   * @property {Record<string, string>} [externalIdentifiers] - optional customer external identifiers that should be reflected on a device entity
   */
  externalIdentifiers?: Record<string, string>;

  /**
   * @property {number} [deviceKeyRsyncIntervals] - number of days used to window the next time the device attestation should use the device fallback key. default is 14 days
   */
  deviceKeyRsyncIntervals?: number;

  /**
   * @property {boolean} [enableTrust] - tie the device payload to a non-extractable crypto key stored on the browser for content authenticity verification
   */
  enableTrust?: boolean;
}

export interface ProtectInitializeConfig
  extends Omit<ProtectConfig, 'envId' | 'waitForWindowLoad' | 'hubUrl' | 'externalIdentifiers'> {
  _type: 'PingOneProtect';
  _action: 'protect_initialize';
  envId?: string;
  customHost?: string;
}

export interface ProtectEvaluationConfig {
  _type: 'PingOneProtect';
  _action: 'protect_risk_evaluation';
  envId: string;
  pauseBehavioralData: boolean;
}

export type ProtectType = 'initialize' | 'evaluate' | 'none';

/**
 * @interface Protect - Interface for methods to interact with the PingOne Signals SDK
 */
export interface Protect {
  /**
   * @async
   * @method start - Method to initialize and start the PingOne Signals SDK
   * @returns {Promise<void>} - Returns a promise
   */
  start: () => Promise<void>;

  /**
   * @async
   * @method getData - Method to get the device data
   * @returns {Promise<string>} - Returns the device data
   */
  getData: () => Promise<string>;

  /**
   * @method pauseBehavioralData - Method to pause the behavioral data collection
   * @returns {void}
   * @description Pause the behavioral data collection only; device profile data will still be collected
   */
  pauseBehavioralData: () => void;

  /**
   * @method resumeBehavioralData - Method to resume the behavioral data collection
   * @returns {void}
   * @description Resume the behavioral data collection
   */
  resumeBehavioralData: () => void;

  /**
   * @method getPauseBehavioralData
   * @param {FRStep} step - A journey step
   * @returns {boolean}
   * @description - Required when using Ping Protect Marketplace nodes
   */
  getPauseBehavioralData: (step: FRStep) => boolean;

  /**
   * @method getNodeConfig - Method for getting the Protect intitialization config options
   * @param {FRStep} step - A journey step
   * @returns {ProtectInitializeConfig | undefined} - The Protect config options
   */
  getNodeConfig: (step: FRStep) => ProtectInitializeConfig | undefined;

  /**
   * @method getPingProtectType - Method for getting the type of step in the Protect flow
   * @param {FRStep} step - A journey step
   * @returns {ProtectType} - The type of step in the Protect flow
   */
  getProtectType: (step: FRStep) => ProtectType;

  /**
   * @method setNodeClientError - Method for setting an error on a Ping Protect Marketplace node
   * @param {FRStep} step - A journey step
   * @param {string} value - The error message to set
   * @returns {void}
   */
  setNodeClientError: (step: FRStep, value: string) => void;

  /**
   * @method setNodeInputValue - Method for setting an input value on a Ping Protect Marketplace node
   * @param {FRStep} step - A journey step
   * @param {string} value - The value to set the input to
   * @returns {void}
   */
  setNodeInputValue: (step: FRStep, value: string) => void;
}
