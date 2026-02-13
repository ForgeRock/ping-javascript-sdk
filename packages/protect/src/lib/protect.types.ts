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
  envId: string;

  // Optional configuration parameters
  agentIdentification?: boolean;
  agentTimeout?: number;
  agentPort?: number;
  behavioralDataCollection?: boolean;
  universalDeviceIdentification?: boolean;
  disableTags?: boolean;
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
