/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fido } from './fido.js';

import type { FidoClientConfig } from './fido.js';
import type { FidoRegistrationOptions, FidoAuthenticationOptions } from '../davinci.types';
import type { GenericError } from '@forgerock/sdk-types';

const silentConfig: FidoClientConfig = { logger: { level: 'none' } };

const mockRegistrationOptions: FidoRegistrationOptions = {
  rp: { id: 'test.example.com', name: 'Test RP' },
  user: { id: [1, 2, 3], displayName: 'test@example.com', name: 'Test User' },
  challenge: [4, 5, 6],
  pubKeyCredParams: [{ type: 'public-key', alg: '-7' }],
  timeout: 60000,
  authenticatorSelection: { userVerification: 'required' },
  attestation: 'none',
};

const mockAuthenticationOptions: FidoAuthenticationOptions = {
  challenge: [4, 5, 6],
  timeout: 60000,
  rpId: 'test.example.com',
  allowCredentials: [{ type: 'public-key', id: [1, 2, 3] }],
  userVerification: 'required',
};

function isGenericError(result: unknown): result is GenericError {
  return typeof result === 'object' && result !== null && 'error' in result;
}

describe('fido', () => {
  const originalCredentials = navigator.credentials;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'credentials', {
      value: originalCredentials,
      writable: true,
      configurable: true,
    });
  });

  describe('register', () => {
    it('should return GenericError with NotAllowedError code when user cancels', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('User canceled', 'NotAllowedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('NotAllowedError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
        expect(result.message).toContain('NotAllowedError');
      }
    });

    it('should return GenericError with AbortError code when operation is aborted', async () => {
      const mockCreate = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('AbortError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with InvalidStateError code when authenticator already registered', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('Already registered', 'InvalidStateError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('InvalidStateError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with NotSupportedError code when algorithm not supported', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('Not supported', 'NotSupportedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('NotSupportedError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with SecurityError code when RP ID mismatch', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('Security error', 'SecurityError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('SecurityError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with TimeoutError code when operation times out', async () => {
      const mockCreate = vi.fn().mockRejectedValue(new DOMException('Timeout', 'TimeoutError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('TimeoutError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with UnknownError code for unrecognized errors', async () => {
      const mockCreate = vi.fn().mockRejectedValue(new Error('Something unexpected'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('UnknownError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with UnknownError code when credential is null', async () => {
      const mockCreate = vi.fn().mockResolvedValue(null);
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('UnknownError');
        expect(result.error).toBe('registration_error');
        expect(result.type).toBe('fido_error');
        expect(result.message).toContain('No credential returned');
      }
    });

    it('should return success value when registration succeeds', async () => {
      const mockCredential = {
        id: 'test-credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        authenticatorAttachment: 'platform',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      };
      const mockCreate = vi.fn().mockResolvedValue(mockCredential);
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(false);
      expect('attestationValue' in result).toBe(true);
    });
  });

  describe('authenticate', () => {
    it('should return GenericError with NotAllowedError code when user cancels', async () => {
      const mockGet = vi
        .fn()
        .mockRejectedValue(new DOMException('User canceled', 'NotAllowedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('NotAllowedError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
        expect(result.message).toContain('NotAllowedError');
      }
    });

    it('should return GenericError with AbortError code when operation is aborted', async () => {
      const mockGet = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('AbortError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with InvalidStateError code when authenticator not found', async () => {
      const mockGet = vi.fn().mockRejectedValue(new DOMException('Not found', 'InvalidStateError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('InvalidStateError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with NotSupportedError code when not supported', async () => {
      const mockGet = vi
        .fn()
        .mockRejectedValue(new DOMException('Not supported', 'NotSupportedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('NotSupportedError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with SecurityError code when RP ID mismatch', async () => {
      const mockGet = vi
        .fn()
        .mockRejectedValue(new DOMException('Security error', 'SecurityError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('SecurityError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with TimeoutError code when operation times out', async () => {
      const mockGet = vi.fn().mockRejectedValue(new DOMException('Timeout', 'TimeoutError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('TimeoutError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with UnknownError code for unrecognized errors', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Something unexpected'));
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('UnknownError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
      }
    });

    it('should return GenericError with UnknownError code when assertion is null', async () => {
      const mockGet = vi.fn().mockResolvedValue(null);
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(true);
      if (isGenericError(result)) {
        expect(result.code).toBe('UnknownError');
        expect(result.error).toBe('authentication_error');
        expect(result.type).toBe('fido_error');
        expect(result.message).toContain('No credential returned');
      }
    });

    it('should return success value when authentication succeeds', async () => {
      const mockAssertion = {
        id: 'test-credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        authenticatorAttachment: 'platform',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          authenticatorData: new ArrayBuffer(8),
          signature: new ArrayBuffer(8),
          userHandle: new ArrayBuffer(8),
        },
      };
      const mockGet = vi.fn().mockResolvedValue(mockAssertion);
      Object.defineProperty(navigator, 'credentials', {
        value: { get: mockGet },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.authenticate(mockAuthenticationOptions);

      expect(isGenericError(result)).toBe(false);
      expect('assertionValue' in result).toBe(true);
    });
  });

  describe('error detection pattern', () => {
    it('should allow consumers to detect errors using "error" in result', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('User canceled', 'NotAllowedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      // This is the recommended pattern for consumers to detect errors
      if ('error' in result) {
        // TypeScript should narrow this to GenericError
        expect(result.error).toBe('registration_error');
        expect(result.code).toBe('NotAllowedError');
      } else {
        // TypeScript should narrow this to FidoRegistrationInputValue
        expect.fail('Expected an error result');
      }
    });
  });

  describe('logger configuration', () => {
    it('should accept optional logger configuration', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('User canceled', 'NotAllowedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      // Should not throw when logger config is provided (uses 'none' to suppress output)
      const fidoClient = fido(silentConfig);
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
    });

    it('should work without logger configuration', async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new DOMException('User canceled', 'NotAllowedError'));
      Object.defineProperty(navigator, 'credentials', {
        value: { create: mockCreate },
        writable: true,
        configurable: true,
      });

      // Should not throw when no config is provided
      const fidoClient = fido();
      const result = await fidoClient.register(mockRegistrationOptions);

      expect(isGenericError(result)).toBe(true);
    });
  });
});
