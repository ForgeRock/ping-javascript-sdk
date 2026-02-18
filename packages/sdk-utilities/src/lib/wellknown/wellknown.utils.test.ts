/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { isValidWellknownUrl, createWellknownError } from './wellknown.utils.js';

describe('wellknown.utils', () => {
  describe('isValidWellknownUrl', () => {
    describe('isValidWellknownUrl_HttpsUrlWithCorrectPath_ReturnsTrue', () => {
      it('should return true for HTTPS URL with correct path suffix', () => {
        expect(isValidWellknownUrl('https://am.example.com/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });

    describe('isValidWellknownUrl_HttpsWithContextPath_ReturnsTrue', () => {
      it('should return true for HTTPS URL with AM context path', () => {
        expect(
          isValidWellknownUrl(
            'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
          ),
        ).toBe(true);
      });
    });

    describe('isValidWellknownUrl_HttpLocalhost_ReturnsTrue', () => {
      it('should return true for HTTP localhost with correct path', () => {
        expect(isValidWellknownUrl('http://localhost:8080/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });

    describe('isValidWellknownUrl_Http127001_ReturnsTrue', () => {
      it('should return true for HTTP 127.0.0.1 with correct path', () => {
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

    describe('isValidWellknownUrl_MissingWellknownPath_ReturnsFalse', () => {
      it('should return false when path does not end with /.well-known/openid-configuration', () => {
        expect(isValidWellknownUrl('https://am.example.com/am/oauth2/alpha')).toBe(false);
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
      it('should return true for HTTPS localhost with correct path', () => {
        expect(isValidWellknownUrl('https://localhost:8443/.well-known/openid-configuration')).toBe(
          true,
        );
      });
    });
  });

  describe('createWellknownError', () => {
    describe('createWellknownError_NoError_ReturnsDefaultError', () => {
      it('should return a default error when no error is provided', () => {
        const result = createWellknownError();

        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('No response received from well-known endpoint');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('unknown');
      });
    });

    describe('createWellknownError_GenericError_ReturnsAsIs', () => {
      it('should return the GenericError directly if already a GenericError', () => {
        const input = {
          error: 'Custom error',
          message: 'Custom message',
          type: 'wellknown_error',
          status: 404,
        };

        const result = createWellknownError(input);

        expect(result).toBe(input);
      });
    });

    describe('createWellknownError_SerializedError_WrapsMessage', () => {
      it('should wrap a SerializedError into a GenericError', () => {
        const input = { name: 'Error', message: 'Something failed' };

        const result = createWellknownError(input);

        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Something failed');
        expect(result.type).toBe('wellknown_error');
      });
    });

    describe('createWellknownError_FetchBaseQueryError_ExtractsErrorString', () => {
      it('should extract message from FetchBaseQueryError .error property', () => {
        const input = { status: 'CUSTOM_ERROR', error: 'Invalid well-known response' };

        const result = createWellknownError(input);

        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Invalid well-known response');
        expect(result.type).toBe('wellknown_error');
      });
    });

    describe('createWellknownError_NumericStatusWithDataMessage_ExtractsMessage', () => {
      it('should extract message from nested .data.message on numeric-status errors', () => {
        // Arrange
        const input = { status: 404, data: { message: 'Not Found' } };

        // Act
        const result = createWellknownError(input);

        // Assert
        expect(result.message).toBe('Not Found');
        expect(result.type).toBe('wellknown_error');
      });
    });

    describe('createWellknownError_NumericStatusWithDataError_ExtractsError', () => {
      it('should extract error string from nested .data.error on numeric-status errors', () => {
        // Arrange
        const input = { status: 500, data: { error: 'Internal Server Error' } };

        // Act
        const result = createWellknownError(input);

        // Assert
        expect(result.message).toBe('Internal Server Error');
        expect(result.type).toBe('wellknown_error');
      });
    });

    describe('createWellknownError_NumericStatusNoData_ReturnsHttpStatus', () => {
      it('should return HTTP status string when no data is present', () => {
        // Arrange
        const input = { status: 503 };

        // Act
        const result = createWellknownError(input);

        // Assert
        expect(result.message).toBe('HTTP error 503');
        expect(result.type).toBe('wellknown_error');
      });
    });

    describe('createWellknownError_FetchError_ExtractsMessage', () => {
      it('should extract message from FETCH_ERROR variant', () => {
        // Arrange
        const input = { status: 'FETCH_ERROR', error: 'Failed to fetch' };

        // Act
        const result = createWellknownError(input);

        // Assert
        expect(result.message).toBe('Failed to fetch');
        expect(result.type).toBe('wellknown_error');
      });
    });
  });
});
