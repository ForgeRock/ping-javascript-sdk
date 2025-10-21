/*
 * @forgerock/ping-javascript-sdk
 *
 * index.ts
 *
 * Copyright (c) 2024 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';

import { JourneyStep } from '../journey-step.utils.js';
import { TextOutputCallback } from '../callbacks/text-output-callback.js';
import { HiddenValueCallback } from '../callbacks/hidden-value-callback.js';

export type QRCodeData = {
  message: string;
  use: string;
  uri: string;
};

/**
 * @class JourneyQRCode - A utility class for handling QR Code steps
 *
 * Example:
 *
 * ```js
 * const isQRCodeStep = JourneyQRCode.isQRCodeStep(step);
 * let qrCodeData;
 * if (isQRCodeStep) {
 *   qrCodeData = JourneyQRCode.getQRCodeData(step);
 * }
 * ```
 */
export abstract class JourneyQRCode {
  /**
   * @method isQRCodeStep - determines if step contains QR Code callbacks
   * @param {JourneyStep} step - step object from AM response
   * @returns {boolean}
   */
  public static isQRCodeStep(step: JourneyStep): boolean {
    const hiddenValueCb = step.getCallbacksOfType(callbackType.HiddenValueCallback);

    // QR Codes step should have at least one HiddenValueCallback
    if (hiddenValueCb.length === 0) {
      return false;
    }
    return !!this.getQRCodeURICb(hiddenValueCb);
  }

  /**
   * @method getQRCodeData - gets the necessary information from the QR Code callbacks
   * @param {JourneyStep} step - step object from AM response
   * @returns {QRCodeData}
   */
  public static getQRCodeData(step: JourneyStep): QRCodeData {
    const hiddenValueCb = step.getCallbacksOfType(callbackType.HiddenValueCallback);

    // QR Codes step should have at least one HiddenValueCallback
    if (hiddenValueCb.length === 0) {
      throw new Error(
        'QR Code step must contain a HiddenValueCallback. Use `FRQRCode.isQRCodeStep` to guard.',
      );
    }
    const qrCodeURICb = this.getQRCodeURICb(hiddenValueCb) as HiddenValueCallback;
    const outputValue = qrCodeURICb ? qrCodeURICb.getOutputValue('value') : '';
    const qrCodeUse =
      typeof outputValue === 'string' && outputValue.includes('otpauth://') ? 'otp' : 'push';

    const messageCbs = step.getCallbacksOfType(callbackType.TextOutputCallback);
    const displayMessageCb = messageCbs.find((cb) => {
      const textOutputCallback = cb as TextOutputCallback;
      return textOutputCallback.getMessageType() !== '4';
    }) as TextOutputCallback | null;

    return {
      message: displayMessageCb ? displayMessageCb.getMessage() : '',
      use: qrCodeUse,
      uri: typeof outputValue === 'string' ? outputValue : '',
    };
  }

  private static getQRCodeURICb(hiddenValueCbs: HiddenValueCallback[]) {
    // Look for a HiddenValueCallback with an OTP URI
    return hiddenValueCbs.find((cb) => {
      const outputValue = cb.getOutputValue('value');

      if (typeof outputValue === 'string') {
        return outputValue?.includes('otpauth://') || outputValue?.includes('pushauth://');
      }
      return false;
    });
  }
}
