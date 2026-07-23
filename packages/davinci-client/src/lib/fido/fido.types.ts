/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { CustomLogger } from '@forgerock/sdk-logger';
import type { GenericError, LogLevel } from '@forgerock/sdk-types';
import type {
  FidoRegistrationInputValue,
  FidoAuthenticationInputValue,
} from '../collector.types.js';
import type { FidoRegistrationOptions, FidoAuthenticationOptions } from '../davinci.types.js';

export interface FidoClientConfig {
  logger?: {
    level?: LogLevel;
    custom?: CustomLogger;
  };
}

export interface FidoClient {
  /**
   * Create a keypair and get the public key credential to send back to DaVinci for registration
   * @function register
   * @param { FidoRegistrationOptions } options - DaVinci FIDO registration options
   * @returns { Promise<FidoRegistrationInputValue | GenericError> } - The formatted credential for DaVinci or an error with WebAuthn error code in `code` field
   */
  register: (
    options: FidoRegistrationOptions,
  ) => Promise<FidoRegistrationInputValue | GenericError>;
  /**
   * Get an assertion to send back to DaVinci for authentication
   * @function authenticate
   * @param { FidoAuthenticationOptions } options - DaVinci FIDO authentication options
   * @returns { Promise<FidoAuthenticationInputValue | GenericError> } - The formatted assertion for DaVinci or an error with WebAuthn error code in `code` field
   */
  authenticate: (
    options: FidoAuthenticationOptions,
  ) => Promise<FidoAuthenticationInputValue | GenericError>;
}

/**
 * WebAuthn error codes that can occur during FIDO operations.
 * These align with standard DOMException names from the WebAuthn specification.
 * Used in the `code` field of GenericError when a FIDO operation fails.
 */
export type FidoErrorCode =
  | 'NotAllowedError'
  | 'AbortError'
  | 'InvalidStateError'
  | 'NotSupportedError'
  | 'SecurityError'
  | 'TimeoutError'
  | 'UnknownError';
