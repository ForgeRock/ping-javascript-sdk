/*
 * @forgerock/javascript-sdk
 *
 * interfaces.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type HiddenValueCallback from '../callbacks/hidden-value-callback.js';
import type MetadataCallback from '../callbacks/metadata-callback.js';
import type TextOutputCallback from '../callbacks/text-output-callback.js';

enum AttestationType {
  Direct = 'direct',
  Indirect = 'indirect',
  None = 'none',
}

interface DeviceStepState extends StepState {
  value1: number;
  value2: number;
}

enum UserVerificationType {
  Discouraged = 'discouraged',
  Preferred = 'preferred',
  Required = 'required',
}

interface RelyingParty {
  name: string;
  id?: string;
}

interface ResponseCredential {
  response: { clientDataJSON: ArrayBuffer };
}

interface Step<TData, TState> {
  data?: TData;
  state: TState;
  type: StepType;
}

interface StepState {
  authId: string;
}

enum StepType {
  DeviceAuthentication = 'DeviceAuthentication',
  DeviceRegistration = 'DeviceRegistration',
  DeviceRegistrationChoice = 'DeviceRegistrationChoice',
  LoginFailure = 'LoginFailure',
  LoginSuccess = 'LoginSuccess',
  OneTimePassword = 'OneTimePassword',
  SecondFactorChoice = 'SecondFactorChoice',
  Username = 'Username',
  UsernamePassword = 'UsernamePassword',
  UserPassword = 'UserPassword',
}

interface WebAuthnRegistrationMetadata {
  attestationPreference: 'none' | 'indirect' | 'direct';
  authenticatorSelection: string;
  challenge: string;
  excludeCredentials: string;
  pubKeyCredParams: string;
  relyingPartyId: string;
  relyingPartyName: string;
  timeout: number;
  userId: string;
  userName: string;
  displayName?: string;
  supportsJsonResponse?: boolean;
}

interface WebAuthnAuthenticationMetadata {
  acceptableCredentials?: string;
  allowCredentials?: string;
  challenge: string;
  relyingPartyId: string;
  timeout: number;
  userVerification: UserVerificationType;
  supportsJsonResponse?: boolean;
}

interface WebAuthnCallbacks {
  hiddenCallback?: HiddenValueCallback;
  metadataCallback?: MetadataCallback;
  textOutputCallback?: TextOutputCallback;
}

type WebAuthnTextOutputRegistration = string;

interface ParsedCredential {
  /**
   * The WebAuthn API (specifically `PublicKeyCredentialDescriptor['id']`) expects a `BufferSource` type.
   * In current TypeScript environments, `SharedArrayBuffer` is not directly assignable to `BufferSource`
   * due to missing properties like `resizable`, `resize`, etc.
   * Although `SharedArrayBuffer` might have been implicitly compatible in older environments,
   * explicitly using `ArrayBuffer` ensures strict type compatibility with the WebAuthn API.
   * The `script-parser.ts` already converts the ID to an `ArrayBuffer` before use.
   *
   * See:
   * - W3C WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialdescriptor
   * - MDN BufferSource: https://developer.mozilla.org/en-US/docs/Web/API/BufferSource
   */
  id: ArrayBuffer;
  type: 'public-key';
}

export type {
  DeviceStepState,
  ParsedCredential,
  RelyingParty,
  ResponseCredential,
  Step,
  WebAuthnCallbacks,
  WebAuthnAuthenticationMetadata,
  WebAuthnRegistrationMetadata,
  WebAuthnTextOutputRegistration,
};
export { AttestationType, StepType, UserVerificationType };
