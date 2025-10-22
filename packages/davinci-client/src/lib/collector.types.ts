/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/** *********************************************************************
 * SINGLE-VALUE COLLECTORS
 */

/**
 * @interface SingleValueCollector - Represents a request to collect a single value from the user, like email or password.
 */
export type SingleValueCollectorTypes =
  | 'PasswordCollector'
  | 'SingleValueCollector'
  | 'SingleSelectCollector'
  | 'SingleSelectObjectCollector'
  | 'TextCollector'
  | 'ValidatedTextCollector';

interface SelectorOption {
  label: string;
  value: string;
}

interface ValidationRequired {
  type: 'required';
  message: string;
  rule: boolean;
}

interface ValidationRegex {
  type: 'regex';
  message: string;
  rule: string;
}

interface ValidationPhoneNumber {
  type: 'validatePhoneNumber';
  message: string;
  rule: boolean;
}

export interface SingleValueCollectorWithValue<T extends SingleValueCollectorTypes> {
  category: 'SingleValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string | number | boolean;
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
    value: string | number | boolean;
  };
}

export interface ValidatedSingleValueCollectorWithValue<T extends SingleValueCollectorTypes> {
  category: 'ValidatedSingleValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string | number | boolean;
    type: string;
    validation: (ValidationRequired | ValidationRegex)[];
  };
  output: {
    key: string;
    label: string;
    type: string;
    value: string | number | boolean;
  };
}

export interface SingleSelectCollectorWithValue<T extends SingleValueCollectorTypes> {
  category: 'SingleValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string | number | boolean;
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
    value: string | number | boolean;
    options: SelectorOption[];
  };
}

export interface SingleValueCollectorNoValue<T extends SingleValueCollectorTypes> {
  category: 'SingleValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string | number | boolean;
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
  };
}

export interface SingleSelectCollectorNoValue<T extends SingleValueCollectorTypes> {
  category: 'SingleValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string | number | boolean;
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
    options: SelectorOption[];
  };
}

/**
 * Type to help infer the collector based on the collector type
 * Used specifically in the returnSingleValueCollector wrapper function.
 * When given a type, it can narrow which type it is returning
 *
 * Note: You can see this type in action in the test file or in the collector.utils file.
 */
export type InferSingleValueCollectorType<T extends SingleValueCollectorTypes> =
  T extends 'TextCollector'
    ? TextCollector
    : T extends 'SingleSelectCollector'
      ? SingleSelectCollector
      : T extends 'ValidatedTextCollector'
        ? ValidatedTextCollector
        : T extends 'PasswordCollector'
          ? PasswordCollector
          : /**
             * At this point, we have not passed in a collector type
             * or we have explicitly passed in 'SingleValueCollector'
             * So we can return either a SingleValueCollector with value
             * or without a value.
             **/
            | SingleValueCollectorWithValue<'SingleValueCollector'>
              | SingleValueCollectorNoValue<'SingleValueCollector'>;

/**
 * SINGLE-VALUE COLLECTOR TYPES
 */
export type SingleValueCollector<T extends SingleValueCollectorTypes> =
  | SingleValueCollectorWithValue<T>
  | SingleValueCollectorNoValue<T>;

export type SingleValueCollectors =
  | SingleValueCollectorNoValue<'PasswordCollector'>
  | SingleSelectCollectorWithValue<'SingleSelectCollector'>
  | SingleValueCollectorWithValue<'SingleValueCollector'>
  | SingleValueCollectorWithValue<'TextCollector'>
  | ValidatedSingleValueCollectorWithValue<'TextCollector'>;

export type PasswordCollector = SingleValueCollectorNoValue<'PasswordCollector'>;
export type TextCollector = SingleValueCollectorWithValue<'TextCollector'>;
export type SingleSelectCollector = SingleSelectCollectorWithValue<'SingleSelectCollector'>;
export type ValidatedTextCollector = ValidatedSingleValueCollectorWithValue<'TextCollector'>;

/** *********************************************************************
 * MULTI-VALUE COLLECTORS
 */

/**
 * @interface MultiValueCollector - Represents a request to collect multiple values from the user.
 */
export type MultiValueCollectorTypes = 'MultiSelectCollector' | 'MultiValueCollector';

export interface MultiValueCollectorWithValue<T extends MultiValueCollectorTypes> {
  category: 'MultiValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string[];
    type: string;
    validation: ValidationRequired[] | null;
  };
  output: {
    key: string;
    label: string;
    type: string;
    value: string[];
    options: SelectorOption[];
  };
}

export interface MultiValueCollectorNoValue<T extends MultiValueCollectorTypes> {
  category: 'MultiValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string[];
    type: string;
    validation: ValidationRequired[] | null;
  };
  output: {
    key: string;
    label: string;
    type: string;
    options: SelectorOption[];
  };
}

/**
 * Type to help infer the collector based on the collector type
 * Used specifically in the returnMultiValueCollector wrapper function.
 * When given a type, it can narrow which type it is returning
 *
 * Note: You can see this type in action in the test file or in the collector.utils file.
 */
export type InferMultiValueCollectorType<T extends MultiValueCollectorTypes> =
  T extends 'MultiSelectCollector'
    ? MultiValueCollectorWithValue<'MultiSelectCollector'>
    :
        | MultiValueCollectorWithValue<'MultiValueCollector'>
        | MultiValueCollectorNoValue<'MultiValueCollector'>;

export type MultiValueCollectors =
  | MultiValueCollectorWithValue<'MultiValueCollector'>
  | MultiValueCollectorWithValue<'MultiSelectCollector'>;

export type MultiValueCollector<T extends MultiValueCollectorTypes> =
  | MultiValueCollectorWithValue<T>
  | MultiValueCollectorNoValue<T>;

export type MultiSelectCollector = MultiValueCollectorWithValue<'MultiSelectCollector'>;

/** *********************************************************************
 * OBJECT COLLECTORS
 */

export type ObjectValueCollectorTypes =
  | 'DeviceAuthenticationCollector'
  | 'DeviceRegistrationCollector'
  | 'PhoneNumberCollector'
  | 'ObjectOptionsCollector'
  | 'ObjectValueCollector'
  | 'ObjectSelectCollector';

interface DeviceOptionWithDefault {
  type: string;
  label: string;
  content: string;
  default: boolean;
  value: string;
  key: string;
}

interface DeviceOptionNoDefault {
  type: string;
  label: string;
  content: string;
  value: string;
  key: string;
}

export interface DeviceValue {
  type: string;
  id: string;
  value: string;
}

export interface PhoneNumberInputValue {
  countryCode: string;
  phoneNumber: string;
}

export interface PhoneNumberOutputValue {
  countryCode?: string;
  phoneNumber?: string;
}

export interface FidoRegistrationInputValue {
  attestationValue?: PublicKeyCredential;
}

export interface FidoAuthenticationInputValue {
  assertionValue?: PublicKeyCredential;
}

export interface ObjectOptionsCollectorWithStringValue<
  T extends ObjectValueCollectorTypes,
  V = string,
> {
  category: 'ObjectValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: V;
    type: string;
    validation: ValidationRequired[] | null;
  };
  output: {
    key: string;
    label: string;
    type: string;
    options: DeviceOptionNoDefault[];
  };
}

export interface ObjectOptionsCollectorWithObjectValue<
  T extends ObjectValueCollectorTypes,
  V = Record<string, string>,
  D = Record<string, string>,
> {
  category: 'ObjectValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: V;
    type: string;
    validation: ValidationRequired[] | null;
  };
  output: {
    key: string;
    label: string;
    type: string;
    options: DeviceOptionWithDefault[];
    value?: D | null;
  };
}

export interface ObjectValueCollectorWithObjectValue<
  T extends ObjectValueCollectorTypes,
  IV = Record<string, string>,
  OV = Record<string, string>,
> {
  category: 'ObjectValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: IV;
    type: string;
    validation: (ValidationRequired | ValidationPhoneNumber)[] | null;
  };
  output: {
    key: string;
    label: string;
    type: string;
    value?: OV | null;
  };
}

export type InferValueObjectCollectorType<T extends ObjectValueCollectorTypes> =
  T extends 'DeviceAuthenticationCollector'
    ? DeviceAuthenticationCollector
    : T extends 'DeviceRegistrationCollector'
      ? DeviceRegistrationCollector
      : T extends 'PhoneNumberCollector'
        ? PhoneNumberCollector
        :
            | ObjectOptionsCollectorWithObjectValue<'ObjectValueCollector'>
            | ObjectOptionsCollectorWithStringValue<'ObjectValueCollector'>;

export type ObjectValueCollectors =
  | DeviceAuthenticationCollector
  | DeviceRegistrationCollector
  | PhoneNumberCollector
  | ObjectOptionsCollectorWithObjectValue<'ObjectSelectCollector'>
  | ObjectOptionsCollectorWithStringValue<'ObjectSelectCollector'>;

export type ObjectValueCollector<T extends ObjectValueCollectorTypes> =
  | ObjectOptionsCollectorWithObjectValue<T>
  | ObjectOptionsCollectorWithStringValue<T>
  | ObjectValueCollectorWithObjectValue<T>;

export type DeviceRegistrationCollector = ObjectOptionsCollectorWithStringValue<
  'DeviceRegistrationCollector',
  string
>;
export type DeviceAuthenticationCollector = ObjectOptionsCollectorWithObjectValue<
  'DeviceAuthenticationCollector',
  DeviceValue
>;
export type PhoneNumberCollector = ObjectValueCollectorWithObjectValue<
  'PhoneNumberCollector',
  PhoneNumberInputValue,
  PhoneNumberOutputValue
>;

/** *********************************************************************
 * ACTION COLLECTORS
 */

/**
 * @interface ActionCollector - Represents a user option to perform an action, like submitting a form or choosing another flow.
 */
export type ActionCollectorTypes =
  | 'FlowCollector'
  | 'SubmitCollector'
  | 'IdpCollector'
  | 'ActionCollector';

export interface ActionCollectorNoUrl<T extends ActionCollectorTypes> {
  category: 'ActionCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  output: {
    key: string;
    label: string;
    type: string;
  };
}

export interface ActionCollectorWithUrl<T extends ActionCollectorTypes> {
  category: 'ActionCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  output: {
    key: string;
    label: string;
    type: string;
    url?: string | null;
  };
}

export type ActionCollector<T extends ActionCollectorTypes> =
  | ActionCollectorNoUrl<T>
  | ActionCollectorWithUrl<T>;

export type InferActionCollectorType<T extends ActionCollectorTypes> = T extends 'IdpCollector'
  ? IdpCollector
  : T extends 'SubmitCollector'
    ? SubmitCollector
    : T extends 'FlowCollector'
      ? FlowCollector
      : ActionCollectorWithUrl<'ActionCollector'> | ActionCollectorNoUrl<'ActionCollector'>;

export type ActionCollectors =
  | ActionCollectorWithUrl<'IdpCollector'>
  | ActionCollectorNoUrl<'ActionCollector'>
  | ActionCollectorNoUrl<'FlowCollector'>
  | ActionCollectorNoUrl<'SubmitCollector'>;

export type FlowCollector = ActionCollectorNoUrl<'FlowCollector'>;
export type IdpCollector = ActionCollectorWithUrl<'IdpCollector'>;
export type SubmitCollector = ActionCollectorNoUrl<'SubmitCollector'>;

/** *********************************************************************
 * NO VALUE COLLECTORS
 */

/**
 * @interface NoValueCollector - Represents a collector that collects no value; text only for display.
 */
export type NoValueCollectorTypes = 'ReadOnlyCollector' | 'NoValueCollector';

export interface NoValueCollectorBase<T extends NoValueCollectorTypes> {
  category: 'NoValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  output: {
    key: string;
    label: string;
    type: string;
  };
}

/**
 * Type to help infer the collector based on the collector type
 * Used specifically in the returnNoValueCollector wrapper function.
 * When given a type, it can narrow which type it is returning
 *
 * Note: You can see this type in action in the test file or in the collector.utils file.
 */
export type InferNoValueCollectorType<T extends NoValueCollectorTypes> =
  T extends 'ReadOnlyCollector'
    ? NoValueCollectorBase<'ReadOnlyCollector'>
    : NoValueCollectorBase<'NoValueCollector'>;

export type NoValueCollectors =
  | NoValueCollectorBase<'NoValueCollector'>
  | NoValueCollectorBase<'ReadOnlyCollector'>;

export type NoValueCollector<T extends NoValueCollectorTypes> = NoValueCollectorBase<T>;

export type ReadOnlyCollector = NoValueCollectorBase<'ReadOnlyCollector'>;

export type UnknownCollector = {
  category: 'UnknownCollector';
  error: string | null;
  type: 'UnknownCollector';
  id: string;
  name: string;
  output: {
    key: string;
    label: string;
    type: string;
  };
};

/** *********************************************************************
 * AUTOMATED COLLECTORS
 */

/**
 * @interface AutoCollector - Represents a collector that collects a value programmatically without user intervention.
 */

export type AutoCollectorCategories = 'SingleValueAutoCollector' | 'ObjectValueAutoCollector';
export type SingleValueAutoCollectorTypes = 'SingleValueAutoCollector' | 'ProtectCollector';
export type ObjectValueAutoCollectorTypes =
  | 'ObjectValueAutoCollector'
  | 'FidoRegistrationCollector'
  | 'FidoAuthenticationCollector';
export type AutoCollectorTypes = SingleValueAutoCollectorTypes | ObjectValueAutoCollectorTypes;

export interface AutoCollector<
  C extends AutoCollectorCategories,
  T extends AutoCollectorTypes,
  IV = string,
> {
  category: C;
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: IV;
    type: string;
    validation?: ValidationRequired[] | null;
  };
  output: {
    key: string;
    type: string;
    config: Record<string, unknown>;
  };
}

export type ProtectCollector = AutoCollector<
  'SingleValueAutoCollector',
  'ProtectCollector',
  string
>;
export type FidoRegistrationCollector = AutoCollector<
  'ObjectValueAutoCollector',
  'FidoRegistrationCollector',
  FidoRegistrationInputValue
>;
export type FidoAuthenticationCollector = AutoCollector<
  'ObjectValueAutoCollector',
  'FidoAuthenticationCollector',
  FidoAuthenticationInputValue
>;
export type SingleValueAutoCollector = AutoCollector<
  'SingleValueAutoCollector',
  'SingleValueAutoCollector',
  string
>;
export type ObjectValueAutoCollector = AutoCollector<
  'ObjectValueAutoCollector',
  'ObjectValueAutoCollector',
  Record<string, unknown>
>;

export type AutoCollectors =
  | ProtectCollector
  | FidoRegistrationCollector
  | FidoAuthenticationCollector
  | SingleValueAutoCollector
  | ObjectValueAutoCollector;

/**
 * Type to help infer the collector based on the collector type
 * Used specifically in the returnAutoCollector wrapper function.
 * When given a type, it can narrow which type it is returning
 *
 * Note: You can see this type in action in the test file or in the collector.utils file.
 */
export type InferAutoCollectorType<T extends AutoCollectorTypes> = T extends 'ProtectCollector'
  ? ProtectCollector
  : T extends 'FidoRegistrationCollector'
    ? FidoRegistrationCollector
    : T extends 'FidoAuthenticationCollector'
      ? FidoAuthenticationCollector
      : T extends 'ObjectValueAutoCollector'
        ? ObjectValueAutoCollector
        : /**
           * At this point, we have not passed in a collector type
           * so we can return a SingleValueAutoCollector
           **/
          SingleValueAutoCollector;
