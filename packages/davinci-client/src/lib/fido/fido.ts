/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Micro } from 'effect';
import { exitIsFail, exitIsSuccess } from 'effect/Micro';
import {
  transformAssertion,
  transformAuthenticationOptions,
  transformPublicKeyCredential,
  transformRegistrationOptions,
} from './fido.utils.js';

import type { GenericError } from '@forgerock/sdk-types';
import type {
  FidoAuthenticationInputValue,
  FidoRegistrationInputValue,
} from '../collector.types.js';
import type { FidoAuthenticationOptions, FidoRegistrationOptions } from '../davinci.types.js';

export interface FidoClient {
  /**
   * Create a keypair and get the public key credential to send back to DaVinci for registration
   * @function register
   * @param { FidoRegistrationOptions } options - DaVinci FIDO registration options
   * @returns { Promise<FidoRegistrationInputValue | GenericError> } - The formatted credential for DaVinci or an error
   */
  register: (
    options: FidoRegistrationOptions,
  ) => Promise<FidoRegistrationInputValue | GenericError>;
  /**
   * Get an assertion to send back to DaVinci for authentication
   * @function authenticate
   * @param { FidoAuthenticationOptions } options - DaVinci FIDO authentication options
   * @returns { Promise<FidoAuthenticationInputValue | GenericError> } - The formatted assertion for DaVinci or an error
   */
  authenticate: (
    options: FidoAuthenticationOptions,
  ) => Promise<FidoAuthenticationInputValue | GenericError>;
}

/**
 * A client function that returns a set of methods for transforming DaVinci data and
 * interacting with the WebAuthn API for registration and authentication
 * @function fido
 * @returns {FidoClient} - A set of methods for FIDO registration and authentication
 */
export function fido(): FidoClient {
  return {
    /**
     * Call WebAuthn API to create keypair and get public key credential
     */
    register: async function register(
      options: FidoRegistrationOptions,
    ): Promise<FidoRegistrationInputValue | GenericError> {
      if (!options) {
        return {
          error: 'registration_error',
          message: 'FIDO registration failed: No options available',
          type: 'fido_error',
        } as GenericError;
      }

      const createCredentialµ = Micro.sync(() => transformRegistrationOptions(options)).pipe(
        Micro.flatMap((publicKeyCredentialCreationOptions) =>
          Micro.tryPromise({
            try: () =>
              navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
              }),
            catch: (error) => {
              console.error('Failed to create keypair: ', error);
              return {
                error: 'registration_error',
                message: 'FIDO registration failed',
                type: 'fido_error',
              } as GenericError;
            },
          }),
        ),
        Micro.flatMap((credential) => {
          if (!credential) {
            return Micro.fail({
              error: 'registration_error',
              message: 'FIDO registration failed: No credential returned',
              type: 'fido_error',
            } as GenericError);
          } else {
            const formattedCredential = transformPublicKeyCredential(
              credential as PublicKeyCredential,
            );
            return Micro.succeed(formattedCredential);
          }
        }),
      );

      const result = await Micro.runPromiseExit(createCredentialµ);

      if (exitIsSuccess(result)) {
        return result.value;
      } else if (exitIsFail(result)) {
        return result.cause.error;
      } else {
        return {
          error: 'fido_registration_error',
          message: result.cause.message,
          type: 'unknown_error',
        };
      }
    },
    /**
     * Call WebAuthn API to get assertion
     */
    authenticate: async function authenticate(
      options: FidoAuthenticationOptions,
    ): Promise<FidoAuthenticationInputValue | GenericError> {
      if (!options) {
        return {
          error: 'authentication_error',
          message: 'FIDO authentication failed: No options available',
          type: 'fido_error',
        } as GenericError;
      }

      const getAssertionµ = Micro.sync(() => transformAuthenticationOptions(options)).pipe(
        Micro.flatMap((publicKeyCredentialRequestOptions) =>
          Micro.tryPromise({
            try: () =>
              navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
              }),
            catch: (error) => {
              console.error('Failed to authenticate: ', error);
              return {
                error: 'authentication_error',
                message: 'FIDO authentication failed',
                type: 'fido_error',
              } as GenericError;
            },
          }),
        ),
        Micro.flatMap((assertion) => {
          if (!assertion) {
            return Micro.fail({
              error: 'authentication_error',
              message: 'FIDO authentication failed: No credential returned',
              type: 'fido_error',
            } as GenericError);
          } else {
            const formattedAssertion = transformAssertion(assertion as PublicKeyCredential);
            return Micro.succeed(formattedAssertion);
          }
        }),
      );

      const result = await Micro.runPromiseExit(getAssertionµ);

      if (exitIsSuccess(result)) {
        return result.value;
      } else if (exitIsFail(result)) {
        return result.cause.error;
      } else {
        return {
          error: 'fido_authentication_error',
          message: result.cause.message,
          type: 'unknown_error',
        };
      }
    },
  };
}
