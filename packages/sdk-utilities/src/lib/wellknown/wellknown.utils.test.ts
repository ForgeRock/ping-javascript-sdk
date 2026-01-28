/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { isValidWellknownUrl } from './wellknown.utils.js';

describe('wellknown.utils', () => {
  describe('isValidWellknownUrl', () => {
    describe('isValidWellknownUrl_HttpsUrl_ReturnsTrue', () => {
      it('should return true for HTTPS URL', () => {
        expect(isValidWellknownUrl('https://am.example.com/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });

    describe('isValidWellknownUrl_HttpLocalhost_ReturnsTrue', () => {
      it('should return true for HTTP localhost', () => {
        expect(isValidWellknownUrl('http://localhost:8080/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });

    describe('isValidWellknownUrl_Http127001_ReturnsTrue', () => {
      it('should return true for HTTP 127.0.0.1', () => {
        expect(isValidWellknownUrl('http://127.0.0.1:8080/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });

    describe('isValidWellknownUrl_HttpNonLocalhost_ReturnsFalse', () => {
      it('should return false for HTTP non-localhost URL', () => {
        expect(isValidWellknownUrl('http://am.example.com/.well-known/openid-configuration')).toBe(
          false,
        );
      });
    });

    describe('isValidWellknownUrl_InvalidUrl_ReturnsFalse', () => {
      it('should return false for invalid URL', () => {
        expect(isValidWellknownUrl('not-a-valid-url')).toBe(false);
      });
    });

    describe('isValidWellknownUrl_EmptyString_ReturnsFalse', () => {
      it('should return false for empty string', () => {
        expect(isValidWellknownUrl('')).toBe(false);
      });
    });

    describe('isValidWellknownUrl_FtpProtocol_ReturnsFalse', () => {
      it('should return false for non-HTTP protocols', () => {
        expect(isValidWellknownUrl('ftp://am.example.com/.well-known/openid-configuration')).toBe(
          false,
        );
      });
    });

    describe('isValidWellknownUrl_HttpsLocalhost_ReturnsTrue', () => {
      it('should return true for HTTPS localhost', () => {
        expect(isValidWellknownUrl('https://localhost:8443/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });
  });
});
