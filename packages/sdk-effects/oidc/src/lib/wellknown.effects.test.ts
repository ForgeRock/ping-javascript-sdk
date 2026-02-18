/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { isValidWellknownResponse, initWellknownQuery } from './wellknown.effects.js';

import type { WellknownResponse } from '@forgerock/sdk-types';

const WELLKNOWN_URL = 'https://example.com/.well-known/openid-configuration';

function createMockWellknown(overrides: Partial<WellknownResponse> = {}): WellknownResponse {
  return {
    issuer: 'https://am.example.com/am/oauth2/alpha',
    authorization_endpoint: 'https://am.example.com/am/oauth2/alpha/authorize',
    token_endpoint: 'https://am.example.com/am/oauth2/alpha/access_token',
    ...overrides,
  };
}

describe('wellknown.effects', () => {
  describe('isValidWellknownResponse', () => {
    describe('isValidWellknownResponse_AllRequiredFields_ReturnsTrue', () => {
      it('should return true when all 3 required fields are present', () => {
        // Arrange
        const data = createMockWellknown();

        // Act
        const result = isValidWellknownResponse(data);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('isValidWellknownResponse_MissingIssuer_ReturnsFalse', () => {
      it('should return false when issuer is missing', () => {
        // Arrange
        const data = {
          authorization_endpoint: 'https://am.example.com/authorize',
          token_endpoint: 'https://am.example.com/token',
        };

        // Act
        const result = isValidWellknownResponse(data);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownResponse_MissingAuthorizationEndpoint_ReturnsFalse', () => {
      it('should return false when authorization_endpoint is missing', () => {
        // Arrange
        const data = {
          issuer: 'https://am.example.com',
          token_endpoint: 'https://am.example.com/token',
        };

        // Act
        const result = isValidWellknownResponse(data);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownResponse_MissingTokenEndpoint_ReturnsFalse', () => {
      it('should return false when token_endpoint is missing', () => {
        // Arrange
        const data = {
          issuer: 'https://am.example.com',
          authorization_endpoint: 'https://am.example.com/authorize',
        };

        // Act
        const result = isValidWellknownResponse(data);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isValidWellknownResponse_StringInput_ReturnsFalse', () => {
      it('should return false for string input', () => {
        expect(isValidWellknownResponse('not an object')).toBe(false);
      });
    });

    describe('isValidWellknownResponse_NullInput_ReturnsFalse', () => {
      it('should return false for null input', () => {
        expect(isValidWellknownResponse(null)).toBe(false);
      });
    });

    describe('isValidWellknownResponse_UndefinedInput_ReturnsFalse', () => {
      it('should return false for undefined input', () => {
        expect(isValidWellknownResponse(undefined)).toBe(false);
      });
    });
  });

  describe('initWellknownQuery', () => {
    describe('initWellknownQuery_SuccessfulCallback_ReturnsData', () => {
      it('should return { data } when callback returns a valid response', async () => {
        // Arrange
        const wellknown = createMockWellknown();
        const callback = async () => ({ data: wellknown });

        // Act
        const result = await initWellknownQuery(WELLKNOWN_URL).applyQuery(callback);

        // Assert
        expect(result).toEqual({ data: wellknown });
      });
    });

    describe('initWellknownQuery_CallbackReturnsError_PassesThroughError', () => {
      it('should pass through the error when callback returns an error result', async () => {
        // Arrange
        const queryError = { status: 404, data: { message: 'Not Found' } };
        const callback = async () => ({ error: queryError });

        // Act
        const result = await initWellknownQuery(WELLKNOWN_URL).applyQuery(callback);

        // Assert
        expect(result).toEqual({ error: queryError });
      });
    });

    describe('initWellknownQuery_CallbackThrows_ReturnsCUSTOM_ERROR', () => {
      it('should catch thrown errors and return CUSTOM_ERROR', async () => {
        // Arrange
        const callback = async () => {
          throw new Error('Network failure');
        };

        // Act
        const result = await initWellknownQuery(WELLKNOWN_URL).applyQuery(callback);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.status).toBe('CUSTOM_ERROR');
        expect(result.error?.error).toBe('Network failure');
      });
    });

    describe('initWellknownQuery_CallbackThrowsNonError_ReturnsCUSTOM_ERROR', () => {
      it('should handle non-Error throws with a generic message', async () => {
        // Arrange
        const callback = async () => {
          throw 'string error';
        };

        // Act
        const result = await initWellknownQuery(WELLKNOWN_URL).applyQuery(callback);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.status).toBe('CUSTOM_ERROR');
        expect(result.error?.error).toBe('An unknown error occurred during well-known fetch');
      });
    });

    describe('initWellknownQuery_InvalidResponse_ReturnsCUSTOM_ERROR', () => {
      it('should return CUSTOM_ERROR when response is missing required fields', async () => {
        // Arrange — response is missing token_endpoint
        const callback = async () => ({
          data: {
            issuer: 'https://am.example.com',
            authorization_endpoint: 'https://am.example.com/authorize',
          },
        });

        // Act
        const result = await initWellknownQuery(WELLKNOWN_URL).applyQuery(callback);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.status).toBe('CUSTOM_ERROR');
        expect(result.error?.error).toContain('missing required fields');
      });
    });

    describe('initWellknownQuery_SetsAcceptHeader_InRequest', () => {
      it('should pass Accept: application/json header in the request', async () => {
        // Arrange
        let capturedArgs: { url: string; headers: Record<string, string> } | undefined;
        const callback = async (args: { url: string; headers: Record<string, string> }) => {
          capturedArgs = args;
          return { data: createMockWellknown() };
        };

        // Act
        await initWellknownQuery(WELLKNOWN_URL).applyQuery(callback);

        // Assert
        expect(capturedArgs).toBeDefined();
        expect(capturedArgs?.headers).toEqual({ Accept: 'application/json' });
        expect(capturedArgs?.url).toBe(WELLKNOWN_URL);
      });
    });
  });
});
