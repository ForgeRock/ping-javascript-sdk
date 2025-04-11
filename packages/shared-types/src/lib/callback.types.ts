// eslint-disable-next-line @typescript-eslint/no-unused-vars
const callbackType = {
  BooleanAttributeInputCallback: 'BooleanAttributeInputCallback',
  ChoiceCallback: 'ChoiceCallback',
  ConfirmationCallback: 'ConfirmationCallback',
  DeviceProfileCallback: 'DeviceProfileCallback',
  HiddenValueCallback: 'HiddenValueCallback',
  KbaCreateCallback: 'KbaCreateCallback',
  MetadataCallback: 'MetadataCallback',
  NameCallback: 'NameCallback',
  NumberAttributeInputCallback: 'NumberAttributeInputCallback',
  PasswordCallback: 'PasswordCallback',
  PingOneProtectEvaluationCallback: 'PingOneProtectEvaluationCallback',
  PingOneProtectInitializeCallback: 'PingOneProtectInitializeCallback',
  PollingWaitCallback: 'PollingWaitCallback',
  ReCaptchaCallback: 'ReCaptchaCallback',
  ReCaptchaEnterpriseCallback: 'ReCaptchaEnterpriseCallback',
  RedirectCallback: 'RedirectCallback',
  SelectIdPCallback: 'SelectIdPCallback',
  StringAttributeInputCallback: 'StringAttributeInputCallback',
  SuspendedTextOutputCallback: 'SuspendedTextOutputCallback',
  TermsAndConditionsCallback: 'TermsAndConditionsCallback',
  TextInputCallback: 'TextInputCallback',
  TextOutputCallback: 'TextOutputCallback',
  ValidatedCreatePasswordCallback: 'ValidatedCreatePasswordCallback',
  ValidatedCreateUsernameCallback: 'ValidatedCreateUsernameCallback',
} as const;

export type CallbackType = (typeof callbackType)[keyof typeof callbackType];

export interface NameValue {
  name: string;
  value: unknown;
}
/**
 * Represents the authentication tree API callback schema.
 */
export interface Callback {
  _id?: number;
  input?: NameValue[];
  output: NameValue[];
  type: CallbackType;
}
