/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Re-export types from internal packages that consumers need
export type { LogLevel, CustomLogger } from '@forgerock/sdk-logger';
export type { RequestMiddleware } from '@forgerock/sdk-request-middleware';
export type {
  Step,
  Callback,
  CallbackType,
  StepType,
  GenericError,
  PolicyRequirement,
  FailedPolicyRequirement,
} from '@forgerock/sdk-types';

// Re-export local types
export * from './lib/client.types.js';
export * from './lib/config.types.js';
export * from './lib/interfaces.js';
export * from './lib/step.types.js';

// Re-export well-known utilities for consumers who need URL inference
export {
  inferRealmFromIssuer,
  inferBaseUrlFromWellknown,
  createWellknownError,
} from './lib/wellknown.utils.js';
export { isValidWellknownUrl } from '@forgerock/sdk-utilities';

export * from './lib/callbacks/attribute-input-callback.js';
export * from './lib/callbacks/base-callback.js';
export * from './lib/callbacks/choice-callback.js';
export * from './lib/callbacks/confirmation-callback.js';
export * from './lib/callbacks/device-profile-callback.js';
export * from './lib/callbacks/factory.js';
export * from './lib/callbacks/hidden-value-callback.js';
export * from './lib/callbacks/kba-create-callback.js';
export * from './lib/callbacks/metadata-callback.js';
export * from './lib/callbacks/name-callback.js';
export * from './lib/callbacks/password-callback.js';
export * from './lib/callbacks/ping-protect-evaluation-callback.js';
export * from './lib/callbacks/ping-protect-initialize-callback.js';
export * from './lib/callbacks/polling-wait-callback.js';
export * from './lib/callbacks/recaptcha-callback.js';
export * from './lib/callbacks/recaptcha-enterprise-callback.js';
export * from './lib/callbacks/redirect-callback.js';
export * from './lib/callbacks/select-idp-callback.js';
export * from './lib/callbacks/suspended-text-output-callback.js';
export * from './lib/callbacks/text-input-callback.js';
export * from './lib/callbacks/text-output-callback.js';
export * from './lib/callbacks/terms-and-conditions-callback.js';
export * from './lib/callbacks/validated-create-password-callback.js';
export * from './lib/callbacks/validated-create-username-callback.js';
