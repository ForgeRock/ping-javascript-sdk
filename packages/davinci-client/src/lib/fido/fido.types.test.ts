/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect } from 'vitest';
import { toFidoErrorCode } from './fido.types';

describe('toFidoErrorCode', () => {
  it('should return NotAllowedError for DOMException with name NotAllowedError', () => {
    const error = new DOMException('User canceled', 'NotAllowedError');
    expect(toFidoErrorCode(error)).toBe('NotAllowedError');
  });

  it('should return AbortError for DOMException with name AbortError', () => {
    const error = new DOMException('Operation aborted', 'AbortError');
    expect(toFidoErrorCode(error)).toBe('AbortError');
  });

  it('should return InvalidStateError for DOMException with name InvalidStateError', () => {
    const error = new DOMException('Invalid state', 'InvalidStateError');
    expect(toFidoErrorCode(error)).toBe('InvalidStateError');
  });

  it('should return NotSupportedError for DOMException with name NotSupportedError', () => {
    const error = new DOMException('Not supported', 'NotSupportedError');
    expect(toFidoErrorCode(error)).toBe('NotSupportedError');
  });

  it('should return SecurityError for DOMException with name SecurityError', () => {
    const error = new DOMException('Security error', 'SecurityError');
    expect(toFidoErrorCode(error)).toBe('SecurityError');
  });

  it('should return TimeoutError for DOMException with name TimeoutError', () => {
    const error = new DOMException('Timeout', 'TimeoutError');
    expect(toFidoErrorCode(error)).toBe('TimeoutError');
  });

  it('should return UnknownError for standard Error', () => {
    const error = new Error('Something went wrong');
    expect(toFidoErrorCode(error)).toBe('UnknownError');
  });

  it('should return UnknownError for non-Error values', () => {
    expect(toFidoErrorCode('string error')).toBe('UnknownError');
    expect(toFidoErrorCode(null)).toBe('UnknownError');
    expect(toFidoErrorCode(undefined)).toBe('UnknownError');
    expect(toFidoErrorCode(42)).toBe('UnknownError');
    expect(toFidoErrorCode({})).toBe('UnknownError');
  });

  it('should return UnknownError for DOMException with unrecognized name', () => {
    const error = new DOMException('Network failed', 'NetworkError');
    expect(toFidoErrorCode(error)).toBe('UnknownError');
  });
});
