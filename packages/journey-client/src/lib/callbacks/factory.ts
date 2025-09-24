/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import JourneyCallback from './index.js';
import type { Callback } from '@forgerock/sdk-types';
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

type JourneyCallbackFactory = (callback: Callback) => JourneyCallback;

/**
 * @hidden
 */
function createCallback(callback: Callback): JourneyCallback {
  switch (callback.type) {
    case callbackType.BooleanAttributeInputCallback:
      return new AttributeInputCallback<boolean>(callback);
    case callbackType.ChoiceCallback:
      return new ChoiceCallback(callback);
    case callbackType.ConfirmationCallback:
      return new ConfirmationCallback(callback);
    case callbackType.DeviceProfileCallback:
      return new DeviceProfileCallback(callback);
    case callbackType.HiddenValueCallback:
      return new HiddenValueCallback(callback);
    case callbackType.KbaCreateCallback:
      return new KbaCreateCallback(callback);
    case callbackType.MetadataCallback:
      return new MetadataCallback(callback);
    case callbackType.NameCallback:
      return new NameCallback(callback);
    case callbackType.NumberAttributeInputCallback:
      return new AttributeInputCallback<number>(callback);
    case callbackType.PasswordCallback:
      return new PasswordCallback(callback);
    case callbackType.PingOneProtectEvaluationCallback:
      return new PingOneProtectEvaluationCallback(callback);
    case callbackType.PingOneProtectInitializeCallback:
      return new PingOneProtectInitializeCallback(callback);
    case callbackType.PollingWaitCallback:
      return new PollingWaitCallback(callback);
    case callbackType.ReCaptchaCallback:
      return new ReCaptchaCallback(callback);
    case callbackType.ReCaptchaEnterpriseCallback:
      return new ReCaptchaEnterpriseCallback(callback);
    case callbackType.RedirectCallback:
      return new RedirectCallback(callback);
    case callbackType.SelectIdPCallback:
      return new SelectIdPCallback(callback);
    case callbackType.StringAttributeInputCallback:
      return new AttributeInputCallback<string>(callback);
    case callbackType.SuspendedTextOutputCallback:
      return new SuspendedTextOutputCallback(callback);
    case callbackType.TermsAndConditionsCallback:
      return new TermsAndConditionsCallback(callback);
    case callbackType.TextInputCallback:
      return new TextInputCallback(callback);
    case callbackType.TextOutputCallback:
      return new TextOutputCallback(callback);
    case callbackType.ValidatedCreatePasswordCallback:
      return new ValidatedCreatePasswordCallback(callback);
    case callbackType.ValidatedCreateUsernameCallback:
      return new ValidatedCreateUsernameCallback(callback);
    default:
      return new JourneyCallback(callback);
  }
}

export default createCallback;
export type { JourneyCallbackFactory };
