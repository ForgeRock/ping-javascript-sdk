/*
 * @forgerock/javascript-sdk
 *
 * interfaces.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { StepType } from './enums.js';

/**
 * Types of callbacks directly supported by the SDK.
 * TODO: We should avoid enums.
 */
export enum CallbackType {
  BooleanAttributeInputCallback = 'BooleanAttributeInputCallback',
  ChoiceCallback = 'ChoiceCallback',
  ConfirmationCallback = 'ConfirmationCallback',
  DeviceProfileCallback = 'DeviceProfileCallback',
  HiddenValueCallback = 'HiddenValueCallback',
  KbaCreateCallback = 'KbaCreateCallback',
  MetadataCallback = 'MetadataCallback',
  NameCallback = 'NameCallback',
  NumberAttributeInputCallback = 'NumberAttributeInputCallback',
  PasswordCallback = 'PasswordCallback',
  PingOneProtectEvaluationCallback = 'PingOneProtectEvaluationCallback',
  PingOneProtectInitializeCallback = 'PingOneProtectInitializeCallback',
  PollingWaitCallback = 'PollingWaitCallback',
  ReCaptchaCallback = 'ReCaptchaCallback',
  ReCaptchaEnterpriseCallback = 'ReCaptchaEnterpriseCallback',
  RedirectCallback = 'RedirectCallback',
  SelectIdPCallback = 'SelectIdPCallback',
  StringAttributeInputCallback = 'StringAttributeInputCallback',
  SuspendedTextOutputCallback = 'SuspendedTextOutputCallback',
  TermsAndConditionsCallback = 'TermsAndConditionsCallback',
  TextInputCallback = 'TextInputCallback',
  TextOutputCallback = 'TextOutputCallback',
  ValidatedCreatePasswordCallback = 'ValidatedCreatePasswordCallback',
  ValidatedCreateUsernameCallback = 'ValidatedCreateUsernameCallback',
}
/**
 * Base interface for all types of authentication step responses.
 */
interface AuthResponse {
  type: StepType;
}

/**
 * Represents details of a failure in an authentication step.
 */
interface FailureDetail {
  failureUrl?: string;
}

/**
 * Represents the authentication tree API payload schema.
 */
interface Step {
  authId?: string;
  callbacks?: Callback[];
  code?: number;
  description?: string;
  detail?: StepDetail;
  header?: string;
  message?: string;
  ok?: string;
  realm?: string;
  reason?: string;
  stage?: string;
  status?: number;
  successUrl?: string;
  tokenId?: string;
}

/**
 * Represents details of a failure in an authentication step.
 */
interface StepDetail {
  failedPolicyRequirements?: FailedPolicyRequirement[];
  failureUrl?: string;
  result?: boolean;
}

/**
 * Represents failed policies for a matching property.
 */
interface FailedPolicyRequirement {
  policyRequirements: PolicyRequirement[];
  property: string;
}

/**
 * Represents a failed policy policy and failed policy params.
 */
interface PolicyRequirement {
  params?: Partial<PolicyParams>;
  policyRequirement: string;
}

interface PolicyParams {
  [key: string]: unknown;
  disallowedFields: string;
  duplicateValue: string;
  forbiddenChars: string;
  maxLength: number;
  minLength: number;
  numCaps: number;
  numNums: number;
}

/**
 * Represents the authentication tree API callback schema.
 */
interface Callback {
  _id?: number;
  input?: NameValue[];
  output: NameValue[];
  type: CallbackType;
}

/**
 * Represents a name/value pair found in an authentication tree callback.
 */
interface NameValue {
  name: string;
  value: unknown;
}

type ConfigurablePaths = keyof CustomPathConfig;
/**
 * Optional configuration for custom paths for actions
 */
interface CustomPathConfig {
  authenticate?: string;
  authorize?: string;
  accessToken?: string;
  endSession?: string;
  userInfo?: string;
  revoke?: string;
  sessions?: string;
}

export type {
  CustomPathConfig,
  ConfigurablePaths,
  Callback,
  FailedPolicyRequirement,
  NameValue,
  PolicyParams,
  PolicyRequirement,
  Step,
  StepDetail,
  AuthResponse,
  FailureDetail,
};
