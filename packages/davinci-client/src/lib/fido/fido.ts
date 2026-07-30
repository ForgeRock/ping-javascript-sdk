/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Micro } from 'effect';
import { exitIsFail, exitIsSuccess } from 'effect/Micro';

import {
  toFidoErrorCode,
  createFidoError,
  transformAssertion,
  transformAuthenticationOptions,
  transformPublicKeyCredential,
  transformRegistrationOptions,
} from './fido.utils.js';

import type { GenericError } from '@forgerock/sdk-types';
import type { FidoClient } from './fido.types.js';
import type {
  FidoAuthenticationInputValue,
  FidoRegistrationInputValue,
} from '../collector.types.js';
import type { FidoAuthenticationOptions, FidoRegistrationOptions } from '../davinci.types.js';

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
        return createFidoError(
          'UnknownError',
          'registration_error',
          'FIDO registration failed: No options available',
        );
      }

      const createCredentialµ = Micro.sync(() => transformRegistrationOptions(options)).pipe(
        Micro.flatMap((publicKeyCredentialCreationOptions) =>
          Micro.tryPromise({
            try: () =>
              navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
              }),
            catch: (error) => {
              const code = toFidoErrorCode(error);
              console.error('Failed to create keypair: ', code);
              return createFidoError(
                code,
                'registration_error',
                `FIDO registration failed: ${code}`,
              );
            },
          }),
        ),
        Micro.flatMap((credential) => {
          if (!credential) {
            return Micro.fail(
              createFidoError(
                'UnknownError',
                'registration_error',
                'FIDO registration failed: No credential returned',
              ),
            );
          }
          return Micro.succeed(transformPublicKeyCredential(credential as PublicKeyCredential));
        }),
      );

      const result = await Micro.runPromiseExit(createCredentialµ);

      if (exitIsSuccess(result)) {
        return result.value;
      } else if (exitIsFail(result)) {
        return result.cause.error;
      } else {
        return createFidoError('UnknownError', 'registration_error', result.cause.message);
      }
    },

    /**
     * Call WebAuthn API to get assertion
     */
    authenticate: async function authenticate(
      options: FidoAuthenticationOptions,
    ): Promise<FidoAuthenticationInputValue | GenericError> {
      if (!options) {
        return createFidoError(
          'UnknownError',
          'authentication_error',
          'FIDO authentication failed: No options available',
        );
      }

      const getAssertionµ = Micro.sync(() => transformAuthenticationOptions(options)).pipe(
        Micro.flatMap((publicKeyCredentialRequestOptions) =>
          Micro.tryPromise({
            try: () =>
              navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
              }),
            catch: (error) => {
              const code = toFidoErrorCode(error);
              console.error('Failed to authenticate: ', code);
              return createFidoError(
                code,
                'authentication_error',
                `FIDO authentication failed: ${code}`,
              );
            },
          }),
        ),
        Micro.flatMap((assertion) => {
          if (!assertion) {
            return Micro.fail(
              createFidoError(
                'UnknownError',
                'authentication_error',
                'FIDO authentication failed: No credential returned',
              ),
            );
          }
          return Micro.succeed(transformAssertion(assertion as PublicKeyCredential));
        }),
      );

      const result = await Micro.runPromiseExit(getAssertionµ);

      if (exitIsSuccess(result)) {
        return result.value;
      } else if (exitIsFail(result)) {
        return result.cause.error;
      } else {
        return createFidoError('UnknownError', 'authentication_error', result.cause.message);
      }
    },
  };
}
