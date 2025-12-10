/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type {
  AttributeInputCallback,
  BaseCallback,
  ChoiceCallback,
  ConfirmationCallback,
  DeviceProfileCallback,
  HiddenValueCallback,
  KbaCreateCallback,
  MetadataCallback,
  NameCallback,
  PasswordCallback,
  PingOneProtectEvaluationCallback,
  PingOneProtectInitializeCallback,
  PollingWaitCallback,
  ReCaptchaCallback,
  ReCaptchaEnterpriseCallback,
  RedirectCallback,
  SelectIdPCallback,
  SuspendedTextOutputCallback,
  TermsAndConditionsCallback,
  TextInputCallback,
  TextOutputCallback,
  ValidatedCreatePasswordCallback,
  ValidatedCreateUsernameCallback,
} from '@forgerock/journey-client/types';

import {
  attributeInputComponent,
  choiceComponent,
  confirmationComponent,
  deviceProfileComponent,
  hiddenValueComponent,
  kbaCreateComponent,
  metadataComponent,
  passwordComponent,
  pingProtectEvaluationComponent,
  pingProtectInitializeComponent,
  pollingWaitComponent,
  recaptchaComponent,
  recaptchaEnterpriseComponent,
  redirectComponent,
  selectIdpComponent,
  suspendedTextOutputComponent,
  termsAndConditionsComponent,
  textInputComponent,
  textOutputComponent,
  validatedPasswordComponent,
  validatedUsernameComponent,
} from './components/index.js';

/**
 * Renders a callback component based on its type
 * @param journeyEl - The container element to append the component to
 * @param callback - The callback instance
 * @param idx - Index for generating unique IDs
 * @param onSubmit - Optional callback to trigger form submission
 */
export function renderCallback(
  journeyEl: HTMLDivElement,
  callback: BaseCallback,
  idx: number,
  onSubmit?: () => void,
): void {
  switch (callback.getType()) {
    case 'BooleanAttributeInputCallback':
    case 'NumberAttributeInputCallback':
    case 'StringAttributeInputCallback':
      attributeInputComponent(
        journeyEl,
        callback as AttributeInputCallback<string | number | boolean>,
        idx,
      );
      break;
    case 'ChoiceCallback':
      choiceComponent(journeyEl, callback as ChoiceCallback, idx);
      break;
    case 'ConfirmationCallback':
      confirmationComponent(journeyEl, callback as ConfirmationCallback, idx);
      break;
    case 'DeviceProfileCallback':
      deviceProfileComponent(journeyEl, callback as DeviceProfileCallback, idx, onSubmit);
      break;
    case 'HiddenValueCallback':
      hiddenValueComponent(journeyEl, callback as HiddenValueCallback, idx);
      break;
    case 'KbaCreateCallback':
      kbaCreateComponent(journeyEl, callback as KbaCreateCallback, idx);
      break;
    case 'MetadataCallback':
      metadataComponent(journeyEl, callback as MetadataCallback, idx);
      break;
    case 'NameCallback':
      textInputComponent(journeyEl, callback as NameCallback, idx);
      break;
    case 'PasswordCallback':
      passwordComponent(journeyEl, callback as PasswordCallback, idx);
      break;
    case 'PingOneProtectEvaluationCallback':
      pingProtectEvaluationComponent(
        journeyEl,
        callback as PingOneProtectEvaluationCallback,
        idx,
        onSubmit,
      );
      break;
    case 'PingOneProtectInitializeCallback':
      pingProtectInitializeComponent(
        journeyEl,
        callback as PingOneProtectInitializeCallback,
        idx,
        onSubmit,
      );
      break;
    case 'PollingWaitCallback':
      pollingWaitComponent(journeyEl, callback as PollingWaitCallback, idx);
      break;
    case 'ReCaptchaCallback':
      recaptchaComponent(journeyEl, callback as ReCaptchaCallback, idx);
      break;
    case 'ReCaptchaEnterpriseCallback':
      recaptchaEnterpriseComponent(journeyEl, callback as ReCaptchaEnterpriseCallback, idx);
      break;
    case 'RedirectCallback':
      redirectComponent(journeyEl, callback as RedirectCallback, idx);
      break;
    case 'SelectIdPCallback':
      selectIdpComponent(journeyEl, callback as SelectIdPCallback, idx);
      break;
    case 'SuspendedTextOutputCallback':
      suspendedTextOutputComponent(journeyEl, callback as SuspendedTextOutputCallback, idx);
      break;
    case 'TermsAndConditionsCallback':
      termsAndConditionsComponent(journeyEl, callback as TermsAndConditionsCallback, idx);
      break;
    case 'TextInputCallback':
      textInputComponent(journeyEl, callback as TextInputCallback, idx);
      break;
    case 'TextOutputCallback':
      textOutputComponent(journeyEl, callback as TextOutputCallback, idx);
      break;
    case 'ValidatedCreatePasswordCallback':
      validatedPasswordComponent(journeyEl, callback as ValidatedCreatePasswordCallback, idx);
      break;
    case 'ValidatedCreateUsernameCallback':
      validatedUsernameComponent(journeyEl, callback as ValidatedCreateUsernameCallback, idx);
      break;
    default:
      console.warn(`Unknown callback type: ${callback.getType()}`);
      break;
  }
}

/**
 * Renders all callbacks in a step
 * @param journeyEl - The container element to append components to
 * @param callbacks - Array of callback instances
 * @param onSubmit - Optional callback to trigger form submission
 */
export function renderCallbacks(
  journeyEl: HTMLDivElement,
  callbacks: BaseCallback[],
  onSubmit?: () => void,
): void {
  callbacks.forEach((callback, idx) => {
    renderCallback(journeyEl, callback, idx, onSubmit);
  });
}
