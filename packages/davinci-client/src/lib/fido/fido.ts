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

export function fido() {
  return {
    register: async function register(
      options: FidoRegistrationOptions,
    ): Promise<FidoRegistrationInputValue | GenericError> {
      /**
       * Call WebAuthn API to create key pair and get public key credential
       */
      const createCredentialµ = Micro.sync(() => transformRegistrationOptions(options)).pipe(
        Micro.flatMap((publicKeyCredentialCreationOptions) =>
          Micro.tryPromise({
            try: () =>
              navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
              }),
            catch: (error) => {
              console.error('Failed to register key pair: ', error);
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
    authenticate: async function authenticate(
      options: FidoAuthenticationOptions,
    ): Promise<FidoAuthenticationInputValue | GenericError> {
      /**
       * Call WebAuthn API to get assertion
       */
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
