/*
 * @forgerock/ping-javascript-sdk
 *
 * ping-one-recognize-callback.test.ts
 *
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { vi, describe, it, expect } from 'vitest';

import { PingOneRecognizeCallback } from './ping-one-recognize-callback.js';

describe('PingOneRecognizeCallback', () => {
  it('should be defined', () => {
    expect(PingOneRecognizeCallback).toBeDefined();
  });

  it('should test that the getOperationType method can be called', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [{ name: 'operationType', value: 'ENROLL' }],
    });
    const mock = vi.spyOn(callback, 'getOperationType');
    const result = callback.getOperationType();
    expect(mock).toHaveBeenCalled();
    expect(result).toBe('ENROLL');
  });

  it('should default getOperationType to AUTHENTICATE when output is missing', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [],
    });
    expect(callback.getOperationType()).toBe('AUTHENTICATE');
  });

  it('should test that the getServiceURL method can be called', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [{ name: 'authenticationServiceUrl', value: 'https://recognize.example.com' }],
    });
    const mock = vi.spyOn(callback, 'getServiceURL');
    const result = callback.getServiceURL();
    expect(mock).toHaveBeenCalled();
    expect(result).toBe('https://recognize.example.com');
  });

  it('should test that the getCustomerName method can be called', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [{ name: 'customerName', value: 'acme' }],
    });
    const mock = vi.spyOn(callback, 'getCustomerName');
    const result = callback.getCustomerName();
    expect(mock).toHaveBeenCalled();
    expect(result).toBe('acme');
  });

  it('should test that the getUsername method can be called', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [{ name: 'username', value: 'jdoe' }],
    });
    const mock = vi.spyOn(callback, 'getUsername');
    const result = callback.getUsername();
    expect(mock).toHaveBeenCalled();
    expect(result).toBe('jdoe');
  });

  it('should test that the getTransactionData method can be called', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [{ name: 'transactionData', value: 'txn-123' }],
    });
    const mock = vi.spyOn(callback, 'getTransactionData');
    const result = callback.getTransactionData();
    expect(mock).toHaveBeenCalled();
    expect(result).toBe('txn-123');
  });

  it('should test that the getOptions method can be called', () => {
    const options = { requestRecognitionFrame: true };
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [{ name: 'webSDKOptions', value: options }],
    });
    const mock = vi.spyOn(callback, 'getOptions');
    const result = callback.getOptions();
    expect(mock).toHaveBeenCalled();
    expect(result).toEqual(options);
  });

  it('should default getOptions to an empty object when output is missing', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [],
    });
    expect(callback.getOptions()).toEqual({});
  });

  it('should test setSignedJwt method', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [],
      input: [{ name: 'IDToken1signedJwt', value: '' }],
    });
    const mock = vi.spyOn(callback, 'setSignedJwt');
    callback.setSignedJwt('jwt-value');
    expect(mock).toHaveBeenCalledWith('jwt-value');
    expect(callback.getInputValue('IDToken1signedJwt')).toBe('jwt-value');
  });

  it('should test setRecognizeId method', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [],
      input: [{ name: 'IDToken1recognizeId', value: '' }],
    });
    const mock = vi.spyOn(callback, 'setRecognizeId');
    callback.setRecognizeId('recognize-id-123');
    expect(mock).toHaveBeenCalledWith('recognize-id-123');
    expect(callback.getInputValue('IDToken1recognizeId')).toBe('recognize-id-123');
  });

  it('should test setClientError method', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [],
      input: [{ name: 'IDToken1clientError', value: '' }],
    });
    // The Keyless SDK's RecognizeError.message is the error code's key name itself
    // (see @forgerock/recognize's getRecognizeErrorCodeKey), so this pairs with the
    // CORE_FACE_NOT_MATCHING (3004) code used in setClientErrorCode below.
    const mock = vi.spyOn(callback, 'setClientError');
    callback.setClientError('CORE_FACE_NOT_MATCHING');
    expect(mock).toHaveBeenCalledWith('CORE_FACE_NOT_MATCHING');
    expect(callback.getInputValue('IDToken1clientError')).toBe('CORE_FACE_NOT_MATCHING');
  });

  it('should test setClientErrorCode method', () => {
    const callback = new PingOneRecognizeCallback({
      type: callbackType.PingOneRecognizeCallback,
      output: [],
      input: [{ name: 'IDToken1clientErrorCode', value: '' }],
    });
    // 3004 is CORE_FACE_NOT_MATCHING from @forgerock/recognize's RECOGNIZE_ERROR_CODE
    const mock = vi.spyOn(callback, 'setClientErrorCode');
    callback.setClientErrorCode('3004');
    expect(mock).toHaveBeenCalledWith('3004');
    expect(callback.getInputValue('IDToken1clientErrorCode')).toBe('3004');
  });
});
