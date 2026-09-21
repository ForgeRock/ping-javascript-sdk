/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { BaseCallback } from './base-callback.js';

import type { Callback } from '@forgerock/sdk-types';

export type PingOneRecognizeOperationType = 'ENROLL' | 'AUTHENTICATE';

/**
 * @class - Represents a callback used to perform PingOne Recognize (Keyless) biometric operations.
 */
export class PingOneRecognizeCallback extends BaseCallback {
  constructor(public override payload: Callback) {
    super(payload);
  }

  public getOperationType(): PingOneRecognizeOperationType {
    return this.getOutputByName<PingOneRecognizeOperationType>('operationType', 'AUTHENTICATE');
  }

  public getServiceURL(): string {
    return this.getOutputByName<string>('authenticationServiceUrl', '');
  }

  public getCustomerName(): string {
    return this.getOutputByName<string>('customerName', '');
  }

  public getUsername(): string {
    return this.getOutputByName<string>('username', '');
  }

  public getTransactionData(): string {
    return this.getOutputByName<string>('transactionData', '');
  }

  public getOptions(): Record<string, unknown> {
    return this.getOutputByName<Record<string, unknown>>('webSDKOptions', {});
  }

  public setSignedJwt(jwt: string): void {
    this.setInputValue(jwt, 'IDToken1signedJwt');
  }

  public setRecognizeId(recognizeId: string): void {
    this.setInputValue(recognizeId, 'IDToken1recognizeId');
  }

  public setClientError(errorMessage: string): void {
    this.setInputValue(errorMessage, 'IDToken1clientError');
  }

  public setClientErrorCode(errorCode: string): void {
    this.setInputValue(errorCode, 'IDToken1clientErrorCode');
  }
}
