/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { isGenericError } from './error.utils.js';
import type { GenericError } from '@forgerock/sdk-types';

describe('isGenericError', () => {
  describe('success cases', () => {
    it('isGenericError_ValidGenericErrorWithRequiredFields_ReturnsTrue', () => {
      // Arrange
      const error: GenericError = {
        error: 'storage_error',
        type: 'unknown_error',
      };

      // Act
      const result = isGenericError(error);

      // Assert
      expect(result).toBe(true);
    });

    it('isGenericError_ValidGenericErrorWithAllFields_ReturnsTrue', () => {
      // Arrange
      const error: GenericError = {
        code: 500,
        error: 'storage_error',
        message: 'Failed to store value',
        status: 500,
        type: 'unknown_error',
      };

      // Act
      const result = isGenericError(error);

      // Assert
      expect(result).toBe(true);
    });

    it('isGenericError_ValidGenericErrorWithParseErrorType_ReturnsTrue', () => {
      // Arrange
      const error: GenericError = {
        error: 'Parsing_error',
        message: 'Error parsing value from session storage',
        type: 'parse_error',
      };

      // Act
      const result = isGenericError(error);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('failure cases', () => {
    it('isGenericError_NullValue_ReturnsFalse', () => {
      // Arrange
      const value = null;

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_UndefinedValue_ReturnsFalse', () => {
      // Arrange
      const value = undefined;

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_PrimitiveString_ReturnsFalse', () => {
      // Arrange
      const value = 'error string';

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_PrimitiveNumber_ReturnsFalse', () => {
      // Arrange
      const value = 500;

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_EmptyObject_ReturnsFalse', () => {
      // Arrange
      const value = {};

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_ObjectMissingErrorProperty_ReturnsFalse', () => {
      // Arrange
      const value = {
        type: 'unknown_error',
        message: 'Some error message',
      };

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_ObjectMissingTypeProperty_ReturnsFalse', () => {
      // Arrange
      const value = {
        error: 'storage_error',
        message: 'Some error message',
      };

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_ObjectWithNonStringError_ReturnsFalse', () => {
      // Arrange
      const value = {
        error: 123,
        type: 'unknown_error',
      };

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_ObjectWithNonStringType_ReturnsFalse', () => {
      const value = {
        error: 'storage_error',
        type: 123,
      };

      const result = isGenericError(value);

      expect(result).toBe(false);
    });

    it('isGenericError_ArrayValue_ReturnsFalse', () => {
      // Arrange
      const value = ['error', 'type'];

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });

    it('isGenericError_ValidDataObject_ReturnsFalse', () => {
      // Arrange
      const value = {
        id: '123',
        name: 'test',
        data: { nested: 'value' },
      };

      // Act
      const result = isGenericError(value);

      // Assert
      expect(result).toBe(false);
    });
  });
});
