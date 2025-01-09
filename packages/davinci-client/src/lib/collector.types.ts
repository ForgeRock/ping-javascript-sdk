/**
 * @interface SingleValueCollector - Represents a request to collect a single value from the user, like email or password.
 */
export type SingleValueCollectorTypes =
  | 'TextCollector'
  | 'PasswordCollector'
  | 'SingleValueCollector'
  | 'FlowLinkCollector'
  | 'DropDownCollector'
  | 'ComboboxCollector'
  | 'RadioCollector';
//| 'LabelCollector';

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
    value: string;
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

/**
 * Type to help infer the collector based on the collector type
 * Used specifically in the returnSingleValueCollector wrapper function.
 * When given a type, it can narrow which type it is returning
 *
 * Note: You can see this type in action in the test file or in the collector.utils file.
 */
export type InferSingleValueCollectorFromSingleValueCollectorType<
  T extends SingleValueCollectorTypes,
> = T extends 'TextCollector'
  ? TextCollector
  : T extends 'DropDownCollector'
    ? DropDownCollector
    : T extends 'ComboboxCollector'
      ? ComboboxCollector
      : T extends 'RadioCollector'
        ? RadioCollector
        : //: T extends 'LabelCollector'
          //? LabelCollector
          T extends 'PasswordCollector'
          ? PasswordCollector
          : T extends 'FlowLinkCollector'
            ? FlowLinkCollector
            : /**
               * At this point, we have not passed in a collector type
               * or we have explicitly passed in 'SingleValueCollector'
               * So we can return either a SingleValueCollector with value or without value
               * or without a value.
               **/
              | SingleValueCollectorWithValue<'SingleValueCollector'>
                | SingleValueCollectorNoValue<'SingleValueCollector'>;

export type SingleValueCollectors =
  | SingleValueCollectorWithValue<'SingleValueCollector'>
  | SingleValueCollectorWithValue<'TextCollector'>
  | SingleValueCollectorWithValue<'DropDownCollector'>
  | SingleValueCollectorWithValue<'ComboboxCollector'>
  | SingleValueCollectorWithValue<'RadioCollector'>
  //| SingleValueCollectorNoValue<'LabelCollector'>
  | SingleValueCollectorNoValue<'PasswordCollector'>
  | SingleValueCollectorNoValue<'FlowLinkCollector'>;

export type SingleValueCollector<T extends SingleValueCollectorTypes> =
  | SingleValueCollectorWithValue<T>
  | SingleValueCollectorNoValue<T>;

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

export type ActionCollectors =
  | ActionCollectorWithUrl<'SocialLoginCollector'>
  | ActionCollectorNoUrl<'ActionCollector'>
  | ActionCollectorNoUrl<'FlowCollector'>
  | ActionCollectorNoUrl<'SubmitCollector'>;

export type FlowCollector = ActionCollectorNoUrl<'FlowCollector'>;
export type PasswordCollector = SingleValueCollectorNoValue<'PasswordCollector'>;
export type TextCollector = SingleValueCollectorWithValue<'TextCollector'>;
export type SocialLoginCollector = ActionCollectorWithUrl<'SocialLoginCollector'>;
export type SubmitCollector = ActionCollectorNoUrl<'SubmitCollector'>;
export type DropDownCollector = SingleValueCollectorWithValue<'DropDownCollector'>;
export type ComboboxCollector = SingleValueCollectorWithValue<'ComboboxCollector'>;
export type RadioCollector = SingleValueCollectorWithValue<'RadioCollector'>;
export type FlowLinkCollector = SingleValueCollectorNoValue<'FlowLinkCollector'>;
//export type LabelCollector = SingleValueCollectorNoValue<'LabelCollector'>;
