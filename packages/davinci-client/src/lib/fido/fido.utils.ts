/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  FidoAuthenticationInputValue,
  FidoRegistrationInputValue,
} from '../collector.types.js';
import type { FidoAuthenticationOptions, FidoRegistrationOptions } from '../davinci.types.js';

function convertArrayToBuffer(arr: number[]): ArrayBuffer {
  return new Int8Array(arr).buffer;
}

function convertBufferToBase64(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  let binaryString = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
    binaryString += String.fromCharCode(byteArray[i]);
  }
  return btoa(binaryString);
}

/**
 * Convert DaVinci registration options to PublicKeyCredentialCreationOptions
 */
export function transformRegistrationOptions(
  options: FidoRegistrationOptions,
): PublicKeyCredentialCreationOptions {
  const pubKeyCredParams = options.pubKeyCredParams.map((param) => ({
    type: param.type,
    alg: typeof param.alg === 'string' ? parseInt(param.alg, 10) : param.alg,
  }));
  const excludeCredentials = options.excludeCredentials?.map((param) => ({
    type: param.type,
    id: convertArrayToBuffer(param.id),
    transports: param.transports,
  }));

  // TODO: extensions.largeBlob and extensions.prf can both potentially contain arrays if they are included.
  //       these should be converted to BufferSource

  return {
    ...options,
    challenge: convertArrayToBuffer(options.challenge),
    user: {
      ...options.user,
      id: convertArrayToBuffer(options.user.id),
    },
    pubKeyCredParams,
    excludeCredentials,
  };
}

/**
 * Format the credential to send back to DaVinci
 */
export function transformPublicKeyCredential(
  credential: PublicKeyCredential,
): FidoRegistrationInputValue {
  const credentialResponse = credential.response as AuthenticatorAttestationResponse;
  const clientDataJSON = convertBufferToBase64(credentialResponse.clientDataJSON);
  const attestationObject = convertBufferToBase64(credentialResponse.attestationObject);
  const rawId = convertBufferToBase64(credential.rawId);

  return {
    attestationValue: {
      id: credential.id,
      rawId,
      type: credential.type,
      authenticatorAttachment: credential.authenticatorAttachment,
      response: {
        clientDataJSON,
        attestationObject,
      },
    },
  };
}

/**
 * Convert DaVinci authentication options to PublicKeyCredentialRequestOptions
 */
export function transformAuthenticationOptions(
  options: FidoAuthenticationOptions,
): PublicKeyCredentialRequestOptions {
  const allowCredentials = options.allowCredentials?.map((param) => ({
    id: convertArrayToBuffer(param.id),
    type: param.type,
    transports: param.transports,
  }));
  const challenge = convertArrayToBuffer(options.challenge);

  // TODO: extensions.largeBlob and extensions.prf can both potentially contain arrays if they are included.
  //       these should be converted to BufferSource

  return {
    ...options,
    challenge,
    allowCredentials,
  };
}

/**
 * Format the assertion to send back to DaVinci
 */
export function transformAssertion(credential: PublicKeyCredential): FidoAuthenticationInputValue {
  const credentialResponse = credential.response as AuthenticatorAssertionResponse;
  const clientDataJSON = convertBufferToBase64(credentialResponse.clientDataJSON);
  const authenticatorData = convertBufferToBase64(credentialResponse.authenticatorData);
  const signature = convertBufferToBase64(credentialResponse.signature);
  const userHandle = credentialResponse.userHandle
    ? convertBufferToBase64(credentialResponse.userHandle)
    : null;
  const rawId = convertBufferToBase64(credential.rawId);

  return {
    assertionValue: {
      id: credential.id,
      rawId,
      type: credential.type,
      authenticatorAttachment: credential.authenticatorAttachment,
      response: {
        clientDataJSON,
        authenticatorData,
        signature,
        userHandle,
      },
    },
  };
}
