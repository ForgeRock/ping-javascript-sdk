/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect, Exit, Cause, Option } from 'effect';

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

      const createCredentialµ = Effect.sync(() => transformRegistrationOptions(options)).pipe(
        Effect.flatMap((publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions) =>
          Effect.tryPromise({
            try: () =>
              navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
              }),
            catch: (error: unknown) => {
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
        Effect.flatMap((credential: Credential | null) => {
          if (!credential) {
            return Effect.fail(
              createFidoError(
                'UnknownError',
                'registration_error',
                'FIDO registration failed: No credential returned',
              ),
            );
          }
          return Effect.succeed(transformPublicKeyCredential(credential as PublicKeyCredential));
        }),
      );

      const result = await Effect.runPromiseExit(createCredentialµ);

      if (Exit.isSuccess(result)) {
        return result.value;
      }

      if (Exit.isFailure(result)) {
        const maybeError = Cause.findErrorOption(result.cause);
        if (Option.isSome(maybeError)) {
          return maybeError.value;
        }
        return createFidoError('UnknownError', 'registration_error', Cause.pretty(result.cause));
      }

      return createFidoError('UnknownError', 'registration_error', 'Unexpected exit state');
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

      const getAssertionµ = Effect.sync(() => transformAuthenticationOptions(options)).pipe(
        Effect.flatMap((publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions) =>
          Effect.tryPromise({
            try: () =>
              navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
              }),
            catch: (error: unknown) => {
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
        Effect.flatMap((assertion: Credential | null) => {
          if (!assertion) {
            return Effect.fail(
              createFidoError(
                'UnknownError',
                'authentication_error',
                'FIDO authentication failed: No credential returned',
              ),
            );
          }
          return Effect.succeed(transformAssertion(assertion as PublicKeyCredential));
        }),
      );

      const result = await Effect.runPromiseExit(getAssertionµ);

      if (Exit.isSuccess(result)) {
        return result.value;
      }

      if (Exit.isFailure(result)) {
        const maybeError = Cause.findErrorOption(result.cause);
        if (Option.isSome(maybeError)) {
          return maybeError.value;
        }
        return createFidoError('UnknownError', 'authentication_error', Cause.pretty(result.cause));
      }

      return createFidoError('UnknownError', 'authentication_error', 'Unexpected exit state');
    },
  };
}
