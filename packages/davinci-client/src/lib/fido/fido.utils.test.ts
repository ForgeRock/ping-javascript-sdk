/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, it, expect } from 'vitest';
import {
  transformAssertion,
  transformAuthenticationOptions,
  transformPublicKeyCredential,
  transformRegistrationOptions,
} from './fido.utils';

import type { FidoAuthenticationOptions, FidoRegistrationOptions } from '../davinci.types';
import type { FidoAuthenticationInputValue, FidoRegistrationInputValue } from '../collector.types';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

describe('FIDO registration utilities', () => {
  it('transformRegistrationOptions should return PublicKeyCredentialCreationOptions', () => {
    const mockOptions: FidoRegistrationOptions = {
      rp: {
        id: 'test.pi.scrd.run',
        name: 'RP Name',
      },
      user: {
        id: [85, -28, 50, 85, -49, -56, 102, 100, 9, 62, -115],
        displayName: 'test@example.com',
        name: 'First Last',
      },
      challenge: [-91, -70, -33, -14, -28, -114, -111, -49, 47, 0, 96],
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: '-7',
        },
        {
          type: 'public-key',
          alg: '-37',
        },
        {
          type: 'public-key',
          alg: '-257',
        },
      ],
      timeout: 120000,
      excludeCredentials: [
        {
          type: 'public-key',
          id: [112, -100, -3, 40, 111, -93, -68, 90, -18, -14, -11, -109, -93, 4, -115, -105],
        },
        {
          type: 'public-key',
          id: [78, -23, 71, -75, 64, 25, -108, -125, -2, -57, 104, 52, 14, -14, -116, 26, 56],
        },
      ],
      authenticatorSelection: {
        residentKey: 'required',
        requireResidentKey: true,
        userVerification: 'required',
      },
      attestation: 'none',
      extensions: {
        credProps: true,
        hmacCreateSecret: true,
      },
    };

    const result = transformRegistrationOptions(mockOptions);
    assertType<PublicKeyCredentialCreationOptions>(result);

    expect(result.rp).toEqual(mockOptions.rp);
    expect(result.timeout).toBe(mockOptions.timeout);
    expect(result.authenticatorSelection).toEqual(mockOptions.authenticatorSelection);
    expect(result.attestation).toBe(mockOptions.attestation);
    expect(result.extensions).toEqual(mockOptions.extensions);

    // Check that standard arrays were converted to ArrayBuffers
    expect(result.challenge).toBeInstanceOf(ArrayBuffer);
    expect(result.user.id).toBeInstanceOf(ArrayBuffer);
    expect(result.excludeCredentials).toBeDefined();
    expect(result.excludeCredentials).toHaveLength(2);
    expectTypeOf(result.excludeCredentials).toEqualTypeOf<
      PublicKeyCredentialDescriptor[] | undefined
    >();

    // Check that pubKeyCredParams.alg values were converted to numbers
    expectTypeOf(result.pubKeyCredParams).toEqualTypeOf<PublicKeyCredentialParameters[]>();
  });

  it('transformPublicKeyCredential should return FidoRegistrationInputValue', () => {
    const rawIdBase64 = 'SGVsbG8sIFdvcmxkIQ==';
    const clientDataJSONBase64 = 'Y2xpZW50RGF0YUpTT04=';
    const attestationObjectBase64 = 'YXR0ZXN0YXRpb25PYmplY3Q=';

    const mockCredential = {
      id: 'MdD7ErRoxf5RBBCm6ODs5g',
      rawId: base64ToArrayBuffer(rawIdBase64),
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: base64ToArrayBuffer(clientDataJSONBase64),
        attestationObject: base64ToArrayBuffer(attestationObjectBase64),
      },
    };

    const result = transformPublicKeyCredential(mockCredential as unknown as PublicKeyCredential);
    const attestationValue = result.attestationValue;

    assertType<FidoRegistrationInputValue>(result);
    expect(attestationValue).toBeDefined();

    expect(attestationValue?.id).toBe(mockCredential.id);
    expect(attestationValue?.type).toBe(mockCredential.type);
    expect(attestationValue?.authenticatorAttachment).toBe(mockCredential.authenticatorAttachment);
    expect(attestationValue?.rawId).toBe(rawIdBase64);
    expect(attestationValue?.response.clientDataJSON).toBe(clientDataJSONBase64);
    expect(attestationValue?.response.attestationObject).toBe(attestationObjectBase64);
  });
});

describe('FIDO authentication utilities', () => {
  it('transformAuthenticationOptions should return PublicKeyCredentialRequestOptions', () => {
    const mockOptions: FidoAuthenticationOptions = {
      challenge: [-91, -70, -33, -14, -28, -114, -111, -49, 47, 0, 96],
      timeout: 120000,
      rpId: 'test.pi.scrd.run',
      allowCredentials: [
        {
          type: 'public-key',
          id: [112, -100, -3, 40, 111, -93, -68, 90, -18, -14, -11, -109, -93, 4, -115, -105],
          transports: ['internal'],
        },
        {
          type: 'public-key',
          id: [78, -23, 71, -75, 64, 25, -108, -125, -2, -57, 104, 52, 14, -14, -116, 26, 56],
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      extensions: {
        credProps: true,
        hmacCreateSecret: true,
      },
    };

    const result = transformAuthenticationOptions(mockOptions);
    assertType<PublicKeyCredentialRequestOptions>(result);

    expect(result.timeout).toBe(mockOptions.timeout);
    expect(result.rpId).toBe(mockOptions.rpId);
    expect(result.userVerification).toBe(mockOptions.userVerification);
    expect(result.extensions).toEqual(mockOptions.extensions);

    // Check that standard arrays were converted to ArrayBuffers
    expect(result.challenge).toBeInstanceOf(ArrayBuffer);
    expect(result.allowCredentials).toBeDefined();
    expect(result.allowCredentials).toHaveLength(2);
    expectTypeOf(result.allowCredentials).toEqualTypeOf<
      PublicKeyCredentialDescriptor[] | undefined
    >();
  });

  it('transformAssertion should return FidoAuthenticationInputValue', () => {
    const rawIdBase64 = 'SGVsbG8sIFdvcmxkIQ==';
    const clientDataJSONBase64 = 'Y2xpZW50RGF0YUpTT04=';
    const authenticatorDataBase64 = 'YXV0aGVudGljYXRvckRhdGE=';
    const signatureBase64 = 'c2lnbmF0dXJl';
    const userHandleBase64 = 'dXNlckhhbmRsZQ==';

    const mockCredential = {
      id: 'MdD7ErRoxf5RBBCm6ODs5g',
      rawId: base64ToArrayBuffer(rawIdBase64),
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: base64ToArrayBuffer(clientDataJSONBase64),
        authenticatorData: base64ToArrayBuffer(authenticatorDataBase64),
        signature: base64ToArrayBuffer(signatureBase64),
        userHandle: base64ToArrayBuffer(userHandleBase64),
      },
    };

    const result = transformAssertion(mockCredential as unknown as PublicKeyCredential);
    const assertionValue = result.assertionValue;

    assertType<FidoAuthenticationInputValue>(result);
    expect(assertionValue).toBeDefined();

    expect(assertionValue?.id).toBe(mockCredential.id);
    expect(assertionValue?.type).toBe(mockCredential.type);
    expect(assertionValue?.authenticatorAttachment).toBe(mockCredential.authenticatorAttachment);
    expect(assertionValue?.rawId).toBe(rawIdBase64);
    expect(assertionValue?.response.clientDataJSON).toBe(clientDataJSONBase64);
    expect(assertionValue?.response.authenticatorData).toBe(authenticatorDataBase64);
    expect(assertionValue?.response.signature).toBe(signatureBase64);
    expect(assertionValue?.response.userHandle).toBe(userHandleBase64);
  });
});
