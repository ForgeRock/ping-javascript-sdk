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

/**
 * @interface Protect - Interface for methods to interact with the PingOne Signals SDK
 */
export interface Protect {
  /**
   * @method start - Method to initialize and start the PingOne Signals SDK
   * @returns {Promise<void>} - Returns a promise
   */
  start: () => Promise<void>;

  /**
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
}
