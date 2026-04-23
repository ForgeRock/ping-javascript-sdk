/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

/**
 * @interface RecognizeConfig - Interface for the Recognize module configuration parameters
 */
export interface RecognizeConfig {
  /**
   * @property {string} customerName - the customer name from your PingOne tenant
   */
  customerName: string;
  /**
   * @property {string} imageEncryptionKey - the image encryption public key to encrypt the selfie image
   */
  imageEncryptionKey: string;
  /**
   * @property {string} imageEncryptionKeyId - the image encryption key id to identify which public key to use to encrypt the selfie image
   */
  imageEncryptionKeyId: string;
  /**
   * @property {string} transactionData - the transaction data to be sent to be signed by the PingOne Recognize API
   */
  transactionData: string;
  /**
   * @property {string} username - the username associated with the transaction
   */
  username: string;
  /**
   * @property {string} [webSocketUrl] - the websocket url for the PingOne Recognize SDK to connect to;
   */
  webSocketUrl: string;
}

/**
 * @interface Recognize - Interface for methods to interact with the PingOne Recognize SDK
 */
export interface Recognize {
  /**
   * @async
   * @method start - Method to initialize and start the PingOne Recognize SDK
   * @returns {Promise<void | { error: string }>} - Returns an error if PingOne Recognize SDK failed to load
   */
  start: () => Promise<void | { error: string }>;
  /**
   * @async
   * @method getData - Method to get the device data
   * @returns {Promise<string | { error: string }>} - Returns the device data or an error if PingOne Recognize SDK failed to load
   */
  //   getData: () => Promise<string | { error: string }>;
  /**
   * @method pauseBehavioralData - Method to pause the behavioral data collection
   * @returns {void | { error: string }} - Returns an error if PingOne Recognize SDK failed to load
   * @description Pause the behavioral data collection only; device profile data will still be collected
   */
  //   pauseBehavioralData: () => void | { error: string };
  /**
   * @method resumeBehavioralData - Method to resume the behavioral data collection
   * @returns {void | { error: string }} - Returns an error if PingOne Recognize SDK failed to load
   * @description Resume the behavioral data collection
   */
  //   resumeBehavioralData: () => void | { error: string };
}
