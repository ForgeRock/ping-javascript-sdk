/**
 * @interface SingleValueCollector - Represents a request to collect a single value from the user, like email or password.
 */
export type SingleValueCollectorTypes =
  | 'PasswordCollector'
  | 'SingleValueCollector'
  | 'SingleSelectCollector'
  | 'TextCollector';

interface SelectorOptions {
  label: string;
  value: string;
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
    options: SelectorOptions[];
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
    options: SelectorOptions[];
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
  | SingleValueCollectorWithValue<'TextCollector'>;

export type PasswordCollector = SingleValueCollectorNoValue<'PasswordCollector'>;
export type TextCollector = SingleValueCollectorWithValue<'TextCollector'>;
export type SingleSelectCollector = SingleSelectCollectorWithValue<'SingleSelectCollector'>;

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
    value: (string | number | boolean)[];
    type: string;
  };
  output: {
    key: string;
    label: string;
    type: string;
    value: (string | number | boolean)[];
    options: SelectorOptions[];
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
    options: SelectorOptions[];
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

/**
 * @interface ActionCollector - Represents a user option to perform an action, like submitting a form or choosing another flow.
 */
export type ActionCollectorTypes =
  | 'FlowCollector'
  | 'SubmitCollector'
  | 'SocialLoginCollector'
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

export type InferActionCollectorType<T extends ActionCollectorTypes> =
  T extends 'SocialLoginCollector'
    ? SocialLoginCollector
    : T extends 'SubmitCollector'
      ? SubmitCollector
      : T extends 'FlowCollector'
        ? FlowCollector
        : ActionCollectorWithUrl<'ActionCollector'> | ActionCollectorNoUrl<'ActionCollector'>;

export type ActionCollectors =
  | ActionCollectorWithUrl<'SocialLoginCollector'>
  | ActionCollectorNoUrl<'ActionCollector'>
  | ActionCollectorNoUrl<'FlowCollector'>
  | ActionCollectorNoUrl<'SubmitCollector'>;

export type FlowCollector = ActionCollectorNoUrl<'FlowCollector'>;
export type SocialLoginCollector = ActionCollectorWithUrl<'SocialLoginCollector'>;
export type SubmitCollector = ActionCollectorNoUrl<'SubmitCollector'>;
