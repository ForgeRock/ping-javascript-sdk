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
 * @interface MultiValueCollector - Represents a request to collect a single value from the user, like email or password.
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
  };
  output: {
    key: string;
    label: string;
    type: string;
    value: string[];
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
  | 'ObjectValueCollector'
  | 'ObjectSelectCollector';

interface ObjectOptionWithValue {
  type: string;
  label: string;
  content: string;
  default: boolean;
  value: string;
  key: string;
}

interface ObjectOptionNoValue {
  type: string;
  label: string;
  content: string;
  value: string;
  key: string;
}

interface ObjectValue {
  type: string;
  id: string;
  value: string;
}

export interface ObjectValueCollectorNoValue<T extends ObjectValueCollectorTypes> {
  category: 'ObjectValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: string | null;
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
    options: ObjectOptionNoValue[];
  };
}

export interface ObjectValueCollectorWithValue<T extends ObjectValueCollectorTypes> {
  category: 'ObjectValueCollector';
  error: string | null;
  type: T;
  id: string;
  name: string;
  input: {
    key: string;
    value: ObjectValue | null;
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
    options: ObjectOptionWithValue[];
  };
}

export type InferValueObjectCollectorType<T extends ObjectValueCollectorTypes> =
  T extends 'DeviceAuthenticationCollector'
    ? DeviceAuthenticationCollector
    : T extends 'DeviceRegistrationCollector'
      ? DeviceRegistrationCollector
      :
          | ObjectValueCollectorWithValue<'ObjectValueCollector'>
          | ObjectValueCollectorNoValue<'ObjectValueCollector'>;

export type ObjectValueCollectors =
  | ObjectValueCollectorWithValue<'DeviceAuthenticationCollector'>
  | ObjectValueCollectorNoValue<'DeviceRegistrationCollector'>
  | ObjectValueCollectorWithValue<'ObjectSelectCollector'>
  | ObjectValueCollectorNoValue<'ObjectSelectCollector'>;

export type ObjectValueCollector<T extends ObjectValueCollectorTypes> =
  | ObjectValueCollectorWithValue<T>
  | ObjectValueCollectorNoValue<T>;

export type DeviceRegistrationCollector =
  ObjectValueCollectorNoValue<'DeviceRegistrationCollector'>;
export type DeviceAuthenticationCollector =
  ObjectValueCollectorWithValue<'DeviceAuthenticationCollector'>;

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
 * @interface NoValueCollector - Represents a collect that collects no value; text only for display.
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
 * Used specifically in the returnMultiValueCollector wrapper function.
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
