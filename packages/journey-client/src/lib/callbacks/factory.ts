/*
 * @forgerock/javascript-sdk
 *
 * factory.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import FRCallback from './index.js';
import { CallbackType } from '../interfaces.js';
import type { Callback } from '../interfaces.js';
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

type FRCallbackFactory = (callback: Callback) => FRCallback;

/**
 * @hidden
 */
function createCallback(callback: Callback): FRCallback {
  switch (callback.type) {
    case CallbackType.BooleanAttributeInputCallback:
      return new AttributeInputCallback<boolean>(callback);
    case CallbackType.ChoiceCallback:
      return new ChoiceCallback(callback);
    case CallbackType.ConfirmationCallback:
      return new ConfirmationCallback(callback);
    case CallbackType.DeviceProfileCallback:
      return new DeviceProfileCallback(callback);
    case CallbackType.HiddenValueCallback:
      return new HiddenValueCallback(callback);
    case CallbackType.KbaCreateCallback:
      return new KbaCreateCallback(callback);
    case CallbackType.MetadataCallback:
      return new MetadataCallback(callback);
    case CallbackType.NameCallback:
      return new NameCallback(callback);
    case CallbackType.NumberAttributeInputCallback:
      return new AttributeInputCallback<number>(callback);
    case CallbackType.PasswordCallback:
      return new PasswordCallback(callback);
    case CallbackType.PingOneProtectEvaluationCallback:
      return new PingOneProtectEvaluationCallback(callback);
    case CallbackType.PingOneProtectInitializeCallback:
      return new PingOneProtectInitializeCallback(callback);
    case CallbackType.PollingWaitCallback:
      return new PollingWaitCallback(callback);
    case CallbackType.ReCaptchaCallback:
      return new ReCaptchaCallback(callback);
    case CallbackType.ReCaptchaEnterpriseCallback:
      return new ReCaptchaEnterpriseCallback(callback);
    case CallbackType.RedirectCallback:
      return new RedirectCallback(callback);
    case CallbackType.SelectIdPCallback:
      return new SelectIdPCallback(callback);
    case CallbackType.StringAttributeInputCallback:
      return new AttributeInputCallback<string>(callback);
    case CallbackType.SuspendedTextOutputCallback:
      return new SuspendedTextOutputCallback(callback);
    case CallbackType.TermsAndConditionsCallback:
      return new TermsAndConditionsCallback(callback);
    case CallbackType.TextInputCallback:
      return new TextInputCallback(callback);
    case CallbackType.TextOutputCallback:
      return new TextOutputCallback(callback);
    case CallbackType.ValidatedCreatePasswordCallback:
      return new ValidatedCreatePasswordCallback(callback);
    case CallbackType.ValidatedCreateUsernameCallback:
      return new ValidatedCreateUsernameCallback(callback);
    default:
      return new FRCallback(callback);
  }
}

export default createCallback;
export type { FRCallbackFactory };
