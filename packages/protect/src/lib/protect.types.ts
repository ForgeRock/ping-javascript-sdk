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
   * @property {boolean} [universalDeviceIdentification] - set to true if you want the device data in the SDK payload to be provided as a signed JWT
   */
  universalDeviceIdentification?: boolean;
}

export interface ProtectInitializeConfig {
  _type: 'PingOneProtect';
  _action: 'protect_initialize';
  envId?: string;
  consoleLogEnabled?: boolean;
  deviceAttributesToIgnore?: string[];
  customHost?: string;
  lazyMetadata?: boolean;
  behavioralDataCollection?: boolean;
  deviceKeyRsyncIntervals?: number;
  enableTrust?: boolean;
  disableTags?: boolean;
  disableHub?: boolean;
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
   * @returns {Promise<void | { error: unknown }>} - Returns an error if PingOne Signals SDK failed to load
   */
  start: () => Promise<void | { error: unknown }>;

  /**
   * @async
   * @method getData - Method to get the device data
   * @returns {Promise<string | { error: unknown }>} - Returns the device data or an error if PingOne Signals SDK failed to load
   */
  getData: () => Promise<string | { error: unknown }>;

  /**
   * @method pauseBehavioralData - Method to pause the behavioral data collection
   * @returns {void | { error: unknown }} - Returns an error if PingOne Signals SDK failed to load
   * @description Pause the behavioral data collection only; device profile data will still be collected
   */
  pauseBehavioralData: () => void | { error: unknown };

  /**
   * @method resumeBehavioralData - Method to resume the behavioral data collection
   * @returns {void | { error: unknown }} - Returns an error if PingOne Signals SDK failed to load
   * @description Resume the behavioral data collection
   */
  resumeBehavioralData: () => void | { error: unknown };

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
