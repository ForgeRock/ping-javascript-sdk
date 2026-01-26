/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { createWellknownError } from './wellknown.utils.js';

describe('wellknown.utils', () => {
  describe('createWellknownError', () => {
    describe('createWellknownError_UndefinedError_ReturnsDefaultMessage', () => {
      it('should return default error when no error provided', () => {
        // Arrange & Act
        const result = createWellknownError(undefined);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('No response received from well-known endpoint');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('unknown');
      });
    });

    describe('createWellknownError_FetchErrorWithString_ReturnsErrorString', () => {
      it('should extract error string from FETCH_ERROR type', () => {
        // Arrange
        const fetchError = {
          status: 'FETCH_ERROR',
          error: 'Network request failed',
        } as const;

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Network request failed');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('FETCH_ERROR');
      });
    });

    describe('createWellknownError_HttpErrorWithDataMessage_ReturnsDataMessage', () => {
      it('should extract message from HTTP error response data', () => {
        // Arrange
        const fetchError = {
          status: 404,
          data: { message: 'Endpoint not found' },
        };

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Endpoint not found');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe(404);
      });
    });

    describe('createWellknownError_HttpErrorWithDataError_ReturnsDataError', () => {
      it('should extract error field from HTTP error response data', () => {
        // Arrange
        const fetchError = {
          status: 401,
          data: { error: 'unauthorized' },
        };

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('unauthorized');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe(401);
      });
    });

    describe('createWellknownError_HttpErrorWithErrorDescription_ReturnsDescription', () => {
      it('should extract error_description from OAuth-style error response', () => {
        // Arrange
        const fetchError = {
          status: 400,
          data: { error_description: 'Invalid client credentials' },
        };

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Invalid client credentials');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe(400);
      });
    });

    describe('createWellknownError_HttpErrorWithUnknownData_ReturnsStringifiedData', () => {
      it('should stringify unknown data structure', () => {
        // Arrange
        const fetchError = {
          status: 500,
          data: { code: 'INTERNAL_ERROR', details: ['Something went wrong'] },
        };

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('{"code":"INTERNAL_ERROR","details":["Something went wrong"]}');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe(500);
      });
    });

    describe('createWellknownError_HttpErrorWithoutData_ReturnsHttpStatus', () => {
      it('should return HTTP status message when no data', () => {
        // Arrange
        // FetchBaseQueryError with numeric status requires data property
        const fetchError = {
          status: 503,
          data: undefined,
        };

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('HTTP error 503');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe(503);
      });
    });

    describe('createWellknownError_SerializedErrorWithMessage_ReturnsMessage', () => {
      it('should extract message from SerializedError', () => {
        // Arrange
        const serializedError = {
          name: 'TypeError',
          message: 'Cannot read property of undefined',
        };

        // Act
        const result = createWellknownError(serializedError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Cannot read property of undefined');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('unknown');
      });
    });

    describe('createWellknownError_SerializedErrorWithoutMessage_ReturnsDefault', () => {
      it('should return default message when SerializedError has no message', () => {
        // Arrange
        const serializedError = {
          name: 'Error',
        };

        // Act
        const result = createWellknownError(serializedError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('An unknown error occurred');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('unknown');
      });
    });

    describe('createWellknownError_TimeoutError_ReturnsTimeoutMessage', () => {
      it('should handle TIMEOUT_ERROR from RTK Query', () => {
        // Arrange
        const fetchError = {
          status: 'TIMEOUT_ERROR',
          error: 'Request timed out',
        } as const;

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Request timed out');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('TIMEOUT_ERROR');
      });
    });

    describe('createWellknownError_ParsingError_ReturnsParsingMessage', () => {
      it('should handle PARSING_ERROR from RTK Query', () => {
        // Arrange
        const fetchError = {
          status: 'PARSING_ERROR',
          originalStatus: 200,
          error: 'Unexpected token < in JSON at position 0',
          data: '<!DOCTYPE html>',
        } as const;

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Unexpected token < in JSON at position 0');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('PARSING_ERROR');
      });
    });

    describe('createWellknownError_CustomError_ReturnsCustomMessage', () => {
      it('should handle CUSTOM_ERROR from RTK Query', () => {
        // Arrange
        const fetchError = {
          status: 'CUSTOM_ERROR',
          error: 'Custom validation failed',
          data: { custom: 'data' },
        } as const;

        // Act
        const result = createWellknownError(fetchError);

        // Assert
        expect(result.error).toBe('Well-known configuration fetch failed');
        expect(result.message).toBe('Custom validation failed');
        expect(result.type).toBe('wellknown_error');
        expect(result.status).toBe('CUSTOM_ERROR');
      });
    });
  });
});
