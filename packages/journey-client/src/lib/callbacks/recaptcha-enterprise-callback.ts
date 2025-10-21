/*
 * @forgerock/ping-javascript-sdk
 *
 * recaptcha-callback.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { JourneyCallback } from './index.js';

/**
 * Represents a callback used to integrate reCAPTCHA.
 */
export class ReCaptchaEnterpriseCallback extends JourneyCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the reCAPTCHA site key.
   */
  public getSiteKey(): string {
    return this.getOutputByName<string>('recaptchaSiteKey', '');
  }

  /**
   * Get the api url
   */
  public getApiUrl(): string {
    return this.getOutputByName<string>('captchaApiUri', '');
  }
  /**
   * Get the class name
   */
  public getElementClass(): string {
    return this.getOutputByName<string>('captchaDivClass', '');
  }
  /**
   * Sets the reCAPTCHA result.
   */
  public setResult(result: string): void {
    this.setInputValue(result);
  }

  /**
   * Set client client error
   */
  public setClientError(error: string) {
    this.setInputValue(error, 'IDToken1clientError');
  }

  /**
   * Set the recaptcha payload
   */
  public setPayload(payload: unknown) {
    this.setInputValue(payload, 'IDToken1payload');
  }

  /**
   * Set the recaptcha action
   */
  public setAction(action: string) {
    this.setInputValue(action, 'IDToken1action');
  }
}
