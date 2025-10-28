/*
 * @forgerock/ping-javascript-sdk
 *
 * interfaces.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { HiddenValueCallback } from '../callbacks/hidden-value-callback.js';
import type { MetadataCallback } from '../callbacks/metadata-callback.js';
import type { TextOutputCallback } from '../callbacks/text-output-callback.js';

export enum AttestationType {
  Direct = 'direct',
  Indirect = 'indirect',
  None = 'none',
}

export interface DeviceStepState extends StepState {
  value1: number;
  value2: number;
}

export enum UserVerificationType {
  Discouraged = 'discouraged',
  Preferred = 'preferred',
  Required = 'required',
}

export interface RelyingParty {
  name: string;
  id?: string;
}

export interface ResponseCredential {
  response: { clientDataJSON: ArrayBuffer };
}

export interface Step<TData, TState> {
  data?: TData;
  state: TState;
  type: StepType;
}

export interface StepState {
  authId: string;
}

export enum StepType {
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

export interface WebAuthnRegistrationMetadata {
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

export interface WebAuthnAuthenticationMetadata {
  acceptableCredentials?: string;
  allowCredentials?: string;
  challenge: string;
  relyingPartyId: string;
  timeout: number;
  userVerification: UserVerificationType;
  supportsJsonResponse?: boolean;
}

export interface WebAuthnCallbacks {
  hiddenCallback?: HiddenValueCallback;
  metadataCallback?: MetadataCallback;
  textOutputCallback?: TextOutputCallback;
}

export type WebAuthnTextOutputRegistration = string;

export interface ParsedCredential {
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
