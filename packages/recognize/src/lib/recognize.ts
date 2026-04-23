/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { KeylessAuthElement, KeylessEnrollElement } from './recognize-sdk/index.js';
import type { Recognize, RecognizeConfig } from './recognize.types.js';

/**
 * @async
 * @function recognize - returns a set of methods to interact with the PingOne Recognize SDK
 * @param {RecognizeConfig} options - the configuration options for the PingOne Recognize SDK
 * @returns {Promise<Recognize>} - a set of methods to interact with the PingOne Recognize SDK
 */
export function recognize(options: RecognizeConfig): Recognize {
  let recognizeApiInitialized: boolean = false;
  let recognizeElement: KeylessAuthElement | KeylessEnrollElement | null = null;

  return {
    start: async (): Promise<void | { error: string }> => {
      try {
        /*
         * Load the Ping Recognize SDK
         * this automatically pollutes the window
         * there are no exports of this module
         */
        await import('./recognize-sdk/index.js' as string);
        recognizeApiInitialized = true;
      } catch (err) {
        console.error('error loading ping recognize', err);
        return { error: 'Failed to load PingOne Recognize SDK' };
      }

      try {
        let element: KeylessAuthElement | KeylessEnrollElement | null;

        element = document.querySelector('kl-auth, kl-enroll');
        if (!element) throw new Error();

        recognizeElement = element;
      } catch (err) {
        console.error('error finding kl-auth or kl-enroll element', err);
        return { error: 'Failed to find kl-auth or kl-enroll element' };
      }

      recognizeElement.customer = options.customerName;
      recognizeElement.key = options.imageEncryptionKey;
      recognizeElement.keyID = options.imageEncryptionKeyId;
      recognizeElement.transactionData = options.transactionData;
      recognizeElement.username = options.username;
      recognizeElement.wsURL = options.webSocketUrl;

      recognizeElement.disableSteps = [
        'bootstrap',
        'camera-instructions',
        'camera-permission',
        'done',
        'error',
        'microphone-permission',
        'server-computation',
        'stm-choice',
        'stm-qrcode',
      ];
    },
  };
}
