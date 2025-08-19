/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

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

  /**
   * @property {boolean} [agentIdentification] - set to true if you are using risk policies that contain the PingID Device Trust predictor. default is false
   */
  agentIdentification?: boolean;

  /**
   * @property {number} [agentTimeout] - If agentIdentification is true, use agentTimeout to specify the timeout the trust agent should use if you don't want to use the default timeout setting. Can be between 200 and 10,000 milliseconds. Default is 5000.
   */
  agentTimeout?: number;

  /**
   * @property {number} [agentPort] - If agentIdentification is true, use agentPort to specify the port to use when connecting to the trust agent if you don't want to use the default port. Default is 9400.
   */
  agentPort?: number;
}

/**
 * @interface Protect - Interface for methods to interact with the PingOne Signals SDK
 */
export interface Protect {
  /**
   * @async
   * @method start - Method to initialize and start the PingOne Signals SDK
   * @returns {Promise<void | { error: string }>} - Returns an error if PingOne Signals SDK failed to load
   */
  start: () => Promise<void | { error: string }>;

  /**
   * @async
   * @method getData - Method to get the device data
   * @returns {Promise<string | { error: string }>} - Returns the device data or an error if PingOne Signals SDK failed to load
   */
  getData: () => Promise<string | { error: string }>;

  /**
   * @method pauseBehavioralData - Method to pause the behavioral data collection
   * @returns {void | { error: string }} - Returns an error if PingOne Signals SDK failed to load
   * @description Pause the behavioral data collection only; device profile data will still be collected
   */
  pauseBehavioralData: () => void | { error: string };

  /**
   * @method resumeBehavioralData - Method to resume the behavioral data collection
   * @returns {void | { error: string }} - Returns an error if PingOne Signals SDK failed to load
   * @description Resume the behavioral data collection
   */
  resumeBehavioralData: () => void | { error: string };
}
