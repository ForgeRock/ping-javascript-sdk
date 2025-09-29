/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { callbackType, type Callback } from '@forgerock/sdk-types';
import createCallback from './factory.js';

// Import all callback classes to check against
import AttributeInputCallback from './attribute-input-callback.js';
import ChoiceCallback from './choice-callback.js';
import ConfirmationCallback from './confirmation-callback.js';
import DeviceProfileCallback from './device-profile-callback.js';
import HiddenValueCallback from './hidden-value-callback.js';
import KbaCreateCallback from './kba-create-callback.js';
import MetadataCallback from './metadata-callback.js';
import NameCallback from './name-callback.js';
import PasswordCallback from './password-callback.js';
import PingOneProtectEvaluationCallback from './ping-protect-evaluation-callback.js';
import PingOneProtectInitializeCallback from './ping-protect-initialize-callback.js';
import PollingWaitCallback from './polling-wait-callback.js';
import ReCaptchaCallback from './recaptcha-callback.js';
import ReCaptchaEnterpriseCallback from './recaptcha-enterprise-callback.js';
import RedirectCallback from './redirect-callback.js';
import SelectIdPCallback from './select-idp-callback.js';
import SuspendedTextOutputCallback from './suspended-text-output-callback.js';
import TermsAndConditionsCallback from './terms-and-conditions-callback.js';
import TextInputCallback from './text-input-callback.js';
import TextOutputCallback from './text-output-callback.js';
import ValidatedCreatePasswordCallback from './validated-create-password-callback.js';
import ValidatedCreateUsernameCallback from './validated-create-username-callback.js';
import JourneyCallback from './index.js';

describe('Callback Factory', () => {
  const testCases = [
    { type: callbackType.BooleanAttributeInputCallback, class: AttributeInputCallback },
    { type: callbackType.ChoiceCallback, class: ChoiceCallback },
    { type: callbackType.ConfirmationCallback, class: ConfirmationCallback },
    { type: callbackType.DeviceProfileCallback, class: DeviceProfileCallback },
    { type: callbackType.HiddenValueCallback, class: HiddenValueCallback },
    { type: callbackType.KbaCreateCallback, class: KbaCreateCallback },
    { type: callbackType.MetadataCallback, class: MetadataCallback },
    { type: callbackType.NameCallback, class: NameCallback },
    { type: callbackType.NumberAttributeInputCallback, class: AttributeInputCallback },
    { type: callbackType.PasswordCallback, class: PasswordCallback },
    {
      type: callbackType.PingOneProtectEvaluationCallback,
      class: PingOneProtectEvaluationCallback,
    },
    {
      type: callbackType.PingOneProtectInitializeCallback,
      class: PingOneProtectInitializeCallback,
    },
    { type: callbackType.PollingWaitCallback, class: PollingWaitCallback },
    { type: callbackType.ReCaptchaCallback, class: ReCaptchaCallback },
    { type: callbackType.ReCaptchaEnterpriseCallback, class: ReCaptchaEnterpriseCallback },
    { type: callbackType.RedirectCallback, class: RedirectCallback },
    { type: callbackType.SelectIdPCallback, class: SelectIdPCallback },
    { type: callbackType.StringAttributeInputCallback, class: AttributeInputCallback },
    { type: callbackType.SuspendedTextOutputCallback, class: SuspendedTextOutputCallback },
    { type: callbackType.TermsAndConditionsCallback, class: TermsAndConditionsCallback },
    { type: callbackType.TextInputCallback, class: TextInputCallback },
    { type: callbackType.TextOutputCallback, class: TextOutputCallback },
    { type: callbackType.ValidatedCreatePasswordCallback, class: ValidatedCreatePasswordCallback },
    { type: callbackType.ValidatedCreateUsernameCallback, class: ValidatedCreateUsernameCallback },
  ];

  testCases.forEach((testCase) => {
    it(`should create an instance of ${testCase.class.name} for type ${testCase.type}`, () => {
      const payload: Callback = { type: testCase.type, input: [], output: [] };
      const callback = createCallback(payload);
      expect(callback).toBeInstanceOf(testCase.class);
    });
  });

  it('should create a base JourneyCallback for an unknown type', () => {
    const payload: Callback = { type: 'UnknownCallback' as any, input: [], output: [] };
    const callback = createCallback(payload);
    expect(callback).toBeInstanceOf(JourneyCallback);
    // Ensure it's not an instance of a more specific class
    expect(callback).not.toBeInstanceOf(NameCallback);
  });
});
