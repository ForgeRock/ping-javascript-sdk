/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the required types
 */
import { CollectorValueType, Validator } from './client.types.js';
import type {
  ActionCollectors,
  ActionCollectorTypes,
  InferSingleValueCollectorType,
  InferMultiValueCollectorType,
  SingleValueCollectorTypes,
  MultiValueCollectorTypes,
  InferActionCollectorType,
  NoValueCollectorTypes,
  InferNoValueCollectorType,
  ValidatedBooleanCollector,
  ValidatedSingleValueCollectorWithValue,
  ValidatedTextCollector,
  InferValueObjectCollectorType,
  ObjectValueCollectorTypes,
  UnknownCollector,
  InferAutoCollectorType,
  PhoneNumberOutputValue,
  MultiValueCollectors,
  ObjectValueCollectors,
  AutoCollectors,
  SingleValueAutoCollectorTypes,
  ObjectValueAutoCollectorTypes,
  QrCodeCollector,
  ReadOnlyCollector,
  RichTextCollector,
  RichContentLink,
  PhoneNumberExtensionOutputValue,
  PasswordCollector,
  ValidatedPasswordCollector,
  BooleanCollector,
} from './collector.types.js';
import type {
  DeviceAuthenticationField,
  DeviceRegistrationField,
  FidoAuthenticationField,
  FidoRegistrationField,
  MultiSelectField,
  PasswordField,
  PhoneNumberField,
  ProtectField,
  QrCodeField,
  PollingField,
  ReadOnlyField,
  RedirectField,
  RichContentReplacement,
  SingleCheckboxField,
  SingleSelectField,
  StandardField,
  ValidatedField,
  AgreementField,
  ReadOnlyFields,
  PhoneNumberExtensionField,
} from './davinci.types.js';

/**
 * @function normalizeReplacements - Flattens the API's keyed
 * `Record<string, RichContentReplacement>` into an array of `RichContentLink`
 * with the original key carried on each entry. Hrefs are passed through
 * unmodified — consumers are responsible for sanitizing before rendering.
 *
 * @param {Record<string, RichContentReplacement>} replacements - The replacements map from the API.
 * @returns {RichContentLink[]} The flattened array of replacement entries.
 */
export function normalizeReplacements(
  replacements: Record<string, RichContentReplacement>,
): RichContentLink[] {
  return Object.entries(replacements).map(([key, replacement]) => ({
    key,
    type: replacement.type,
    value: replacement.value,
    href: replacement.href,
    ...(replacement.target && { target: replacement.target }),
  }));
}

/**
 * @function returnActionCollector - Creates an ActionCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ActionCollector.
 * @param {ActionCollectorTypes} [collectorType] - Optional type of the ActionCollector.
 * @returns {ActionCollector} The constructed ActionCollector object.
 */
export function returnActionCollector<CollectorType extends ActionCollectorTypes>(
  field: RedirectField | StandardField,
  idx: number,
  collectorType: CollectorType,
): ActionCollectors {
  let error = '';
  if (!('label' in field)) {
    error = `${error}Label is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  if (collectorType === 'IdpCollector') {
    let link;
    if (!('links' in field)) {
      error = `${error}Links property is not found in the field object. `;
      link = null;
    } else {
      link = field.links?.['authenticate']?.href || null;
    }
    return {
      category: 'ActionCollector',
      error: error || null,
      type: collectorType,
      id: `${field.key || field.type}-${idx}`,
      name: field.key || field.type,
      output: {
        key: `${field.key || field.type}-${idx}`,
        label: field.label,
        type: field.type,
        url: link,
      },
    } as InferActionCollectorType<'IdpCollector'>;
  } else {
    if (!('key' in field)) {
      error = `${error}Key is not found in the field object. `;
    }
    return {
      category: 'ActionCollector',
      error: error || null,
      type: collectorType || 'ActionCollector',
      id: `${field.key}-${idx}`,
      name: field.key,
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
      },
    } as InferActionCollectorType<CollectorType>;
  }
}

/**
 * @function returnFlowCollector - Returns a flow collector object
 * @param {DaVinciField} field - The field representing the flow button
 * @param {number} idx - The index of the field in the form
 * @returns {FlowCollector} - The flow collector object
 */
export function returnFlowCollector(field: StandardField, idx: number) {
  return returnActionCollector(field, idx, 'FlowCollector');
}

/**
 * @function returnIdpCollector - Returns a social login collector object
 * @param {DaVinciField} field - The field representing the social login button
 * @param {number} idx - The index of the field in the form
 * @returns {SocialLoginCollector} - The social login collector object
 */
export function returnIdpCollector(field: RedirectField, idx: number) {
  return returnActionCollector(field, idx, 'IdpCollector');
}

/**
 * @function returnSubmitCollector - Returns a submit collector object
 * @param {DaVinciField} field - The field representing the submit button
 * @param {number} idx - The index of the field in the form
 * @returns {ActionCollector} - The submit collector object
 */
export function returnSubmitCollector(field: StandardField, idx: number) {
  return returnActionCollector(field, idx, 'SubmitCollector');
}

/**
 * @function returnSingleValueCollector - Creates a SingleValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the SingleValueCollector.
 * @param {SingleValueCollectorTypes} [collectorType] - Optional type of the SingleValueCollector.
 * @returns {SingleValueCollector} The constructed SingleValueCollector object.
 */
export function returnSingleValueCollector<
  Field extends
    | StandardField
    | SingleSelectField
    | ValidatedField
    | PasswordField
    | SingleCheckboxField,
  CollectorType extends SingleValueCollectorTypes = 'SingleValueCollector',
>(field: Field, idx: number, collectorType: CollectorType, data?: string) {
  let error = '';
  if (!('key' in field)) {
    error = `${error}Key is not found in the field object. `;
  }
  if (!('label' in field)) {
    error = `${error}Label is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  if (collectorType === 'PasswordCollector') {
    const verify = 'verify' in field ? field.verify === true : false;
    return {
      category: 'SingleValueCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        verify,
      },
    } as InferSingleValueCollectorType<CollectorType>;
  } else if (collectorType === 'ValidatedPasswordCollector') {
    // Reducer routes here only when passwordPolicy is present, but fallback to {} keeps the
    // factory total and consistent with the type definition (passwordPolicy is optional).
    const validation =
      'passwordPolicy' in field && field.passwordPolicy ? field.passwordPolicy : {};
    const verify = 'verify' in field ? field.verify === true : false;
    return {
      category: 'SingleValueCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
        validation,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        verify,
      },
    } as InferSingleValueCollectorType<CollectorType>;
  } else if (collectorType === 'SingleSelectCollector') {
    /**
     * Check if options are present in the field object first
     * If found, return existing error, which should be ''
     * If not found, add additional message to error string
     */
    const err = 'options' in field ? error : `${error}Options are not found in the field object. `;
    const options = 'options' in field ? field.options : []; // Fallback to ensure type consistency

    return {
      category: 'SingleValueCollector',
      error: err || null,
      type: collectorType,
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        value: data || '',
        options: options,
      },
    } as InferSingleValueCollectorType<'SingleSelectCollector'>;
  } else if (collectorType === 'BooleanCollector') {
    const richContent =
      'richContent' in field && field.richContent
        ? {
            content: field.richContent.content,
            replacements: normalizeReplacements(field.richContent.replacements ?? {}),
          }
        : undefined;

    return {
      category: 'SingleValueCollector',
      error: error || null,
      type: collectorType,
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: false,
        type: field.type,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        value: false,
        appearance: ('appearance' in field && field.appearance) || '',
        ...(richContent && { richContent }),
      },
    } as InferSingleValueCollectorType<'BooleanCollector'>;
  } else if (collectorType === 'ValidatedBooleanCollector') {
    const validationArray = [];
    if ('required' in field && field.required === true) {
      validationArray.push({
        type: 'required',
        message: ('errorMessage' in field && field.errorMessage) || 'Value cannot be empty',
        rule: true,
      });
    }

    const richContent =
      'richContent' in field && field.richContent
        ? {
            content: field.richContent.content,
            replacements: normalizeReplacements(field.richContent.replacements ?? {}),
          }
        : undefined;

    return {
      category: 'ValidatedSingleValueCollector',
      error: error || null,
      type: collectorType,
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: false,
        type: field.type,
        validation: validationArray,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        value: false,
        appearance: ('appearance' in field && field.appearance) || '',
        ...(richContent && { richContent }),
      },
    } as InferSingleValueCollectorType<'ValidatedBooleanCollector'>;
  } else if ('validation' in field || 'required' in field) {
    const validationArray = [];

    if ('validation' in field && field.validation && 'regex' in field.validation) {
      validationArray.push({
        type: 'regex',
        message: field.validation?.errorMessage || '',
        rule: field.validation?.regex || '',
      });
    }
    if ('required' in field && field.required === true) {
      validationArray.push({
        type: 'required',
        message: 'Value cannot be empty',
        rule: true,
      });
    }

    return {
      category: 'ValidatedSingleValueCollector',
      error: error || null,
      type: 'TextCollector',
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: data || '',
        type: field.type,
        validation: validationArray,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        value: data || '',
      },
    } as ValidatedSingleValueCollectorWithValue<'TextCollector'>;
  } else {
    return {
      category: 'SingleValueCollector',
      error: error || null,
      type: collectorType || 'SingleValueCollector',
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
      },
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        value: data || '',
      },
    } as InferSingleValueCollectorType<CollectorType>;
  }
}

/**
 * @function returnSingleValueAutoCollector - Creates a SingleValueAutoCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the AutoCollector.
 * @param {SingleValueAutoCollectorTypes} [collectorType] - Optional type of the AutoCollector.
 * @returns {AutoCollector} The constructed AutoCollector object.
 */
export function returnSingleValueAutoCollector<
  Field extends ProtectField | PollingField,
  CollectorType extends SingleValueAutoCollectorTypes = 'SingleValueAutoCollector',
>(field: Field, idx: number, collectorType: CollectorType) {
  let error = '';
  if (!('key' in field)) {
    error = `${error}Key is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  if (collectorType === 'ProtectCollector' && field.type === 'PROTECT') {
    return {
      category: 'SingleValueAutoCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
      },
      output: {
        key: field.key,
        type: field.type,
        config: {
          behavioralDataCollection: field.behavioralDataCollection,
          universalDeviceIdentification: field.universalDeviceIdentification,
        },
      },
    } as InferAutoCollectorType<'ProtectCollector'>;
  } else if (collectorType === 'PollingCollector' && field.type === 'POLLING') {
    return {
      category: 'SingleValueAutoCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
      },
      output: {
        key: field.key,
        type: field.type,
        config: {
          pollInterval: field.pollInterval,
          pollRetries: field.pollRetries,
          ...(field.pollChallengeStatus !== undefined && {
            pollChallengeStatus: field.pollChallengeStatus,
          }),
          ...(field.challenge && { challenge: field.challenge }),
          ...(!field.challenge && { retriesRemaining: field.pollRetries }),
        },
      },
    } as InferAutoCollectorType<'PollingCollector'>;
  } else {
    return {
      category: 'SingleValueAutoCollector',
      error: error || null,
      type: collectorType || 'SingleValueAutoCollector',
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: '',
        type: field.type,
      },
      output: {
        key: field.key,
        type: field.type,
      },
    } as InferAutoCollectorType<CollectorType>;
  }
}

/**
 * @function returnObjectValueAutoCollector - Creates an ObjectValueAutoCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the AutoCollector.
 * @param {ObjectValueAutoCollectorTypes} [collectorType] - Optional type of the AutoCollector.
 * @returns {AutoCollector} The constructed AutoCollector object.
 */
export function returnObjectValueAutoCollector<
  Field extends FidoRegistrationField | FidoAuthenticationField,
  CollectorType extends ObjectValueAutoCollectorTypes = 'ObjectValueAutoCollector',
>(field: Field, idx: number, collectorType: CollectorType) {
  let error = '';
  if (!('key' in field)) {
    error = `${error}Key is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  const validationArray = [];
  if ('required' in field && field.required === true) {
    validationArray.push({
      type: 'required',
      message: 'Value cannot be empty',
      rule: true,
    });
  }

  if (field.action === 'REGISTER') {
    return {
      category: 'ObjectValueAutoCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: {},
        type: field.type,
        validation: validationArray.length ? validationArray : null,
      },
      output: {
        key: field.key,
        type: field.type,
        config: {
          publicKeyCredentialCreationOptions: field.publicKeyCredentialCreationOptions,
          action: field.action,
          trigger: field.trigger,
        },
      },
    } as InferAutoCollectorType<'FidoRegistrationCollector'>;
  } else {
    return {
      category: 'ObjectValueAutoCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: {},
        type: field.type,
        validation: validationArray.length ? validationArray : null,
      },
      output: {
        key: field.key,
        type: field.type,
        config: {
          publicKeyCredentialRequestOptions: field.publicKeyCredentialRequestOptions,
          action: field.action,
          trigger: field.trigger,
        },
      },
    } as InferAutoCollectorType<'FidoAuthenticationCollector'>;
  }
}

/**
 * @function returnPasswordCollector - Creates a PasswordCollector (no password policy).
 * @param {PasswordField} field - The PASSWORD / PASSWORD_VERIFY field; a `verify` flag is
 *   propagated to the collector output if set.
 * @param {number} idx - The index to be used in the id of the PasswordCollector.
 * @returns {PasswordCollector} The constructed PasswordCollector object.
 */
export function returnPasswordCollector(field: PasswordField, idx: number): PasswordCollector {
  return returnSingleValueCollector(field, idx, 'PasswordCollector') as PasswordCollector;
}

/**
 * @function returnValidatedPasswordCollector - Creates a ValidatedPasswordCollector for
 *   fields that carry a `passwordPolicy`. The reducer routes both `PASSWORD` and
 *   `PASSWORD_VERIFY` here when a policy is present.
 * @param {PasswordField} field - The PASSWORD or PASSWORD_VERIFY field carrying a passwordPolicy.
 * @param {number} idx - The index of the field in the form.
 * @returns {ValidatedPasswordCollector} The constructed ValidatedPasswordCollector.
 */
export function returnValidatedPasswordCollector(
  field: PasswordField,
  idx: number,
): ValidatedPasswordCollector {
  return returnSingleValueCollector(
    field,
    idx,
    'ValidatedPasswordCollector',
  ) as ValidatedPasswordCollector;
}

/**
 * @function returnTextCollector - Creates a TextCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the TextCollector.
 * @returns {TextCollector} The constructed TextCollector object.
 */
export function returnTextCollector(field: StandardField, idx: number, data: string) {
  return returnSingleValueCollector(field, idx, 'TextCollector', data);
}

/**
 * @function returnSingleSelectCollector - Creates a SingleCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the SingleCollector.
 * @returns {SingleValueCollector} The constructed SingleCollector object.
 */
export function returnSingleSelectCollector(field: SingleSelectField, idx: number, data: string) {
  return returnSingleValueCollector(field, idx, 'SingleSelectCollector', data);
}

/**
 * @function returnBooleanCollector - Creates a BooleanCollector (no validation).
 * @param {SingleCheckboxField} field - The field object containing key, label, type.
 * @param {number} idx - The index to be used in the id of the BooleanCollector.
 * @returns {BooleanCollector} The constructed BooleanCollector object.
 */
export function returnBooleanCollector(field: SingleCheckboxField, idx: number): BooleanCollector {
  return returnSingleValueCollector(field, idx, 'BooleanCollector') as BooleanCollector;
}

/**
 * @function returnValidatedBooleanCollector - Creates a ValidatedBooleanCollector object based on the provided field and index.
 * @param {SingleCheckboxField} field - The field object containing key, label, type, required, and validation.
 * @param {number} idx - The index to be used in the id of the ValidatedBooleanCollector.
 * @returns {ValidatedBooleanCollector} The constructed ValidatedBooleanCollector object.
 */
export function returnValidatedBooleanCollector(
  field: SingleCheckboxField,
  idx: number,
): ValidatedBooleanCollector {
  return returnSingleValueCollector(
    field,
    idx,
    'ValidatedBooleanCollector',
  ) as ValidatedBooleanCollector;
}

/**
 * @function returnProtectCollector - Creates a ProtectCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ProtectCollector.
 * @returns {ProtectCollector} The constructed ProtectCollector object.
 */
export function returnProtectCollector(field: ProtectField, idx: number) {
  return returnSingleValueAutoCollector(field, idx, 'ProtectCollector');
}

/**
 * @function returnPollingCollector - Creates a PollingCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the PollingCollector.
 * @returns {PollingCollector} The constructed PollingCollector object.
 */
export function returnPollingCollector(field: PollingField, idx: number) {
  return returnSingleValueAutoCollector(field, idx, 'PollingCollector');
}

/**
 * @function returnFidoRegistrationCollector - Creates a FidoRegistrationCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the FidoRegistrationCollector.
 * @returns {FidoRegistrationCollector} The constructed FidoRegistrationCollector object.
 */
export function returnFidoRegistrationCollector(field: FidoRegistrationField, idx: number) {
  return returnObjectValueAutoCollector(field, idx, 'FidoRegistrationCollector');
}

/**
 * @function returnFidoAuthenticationCollector - Creates a FidoAuthenticationCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the FidoAuthenticationCollector.
 * @returns {FidoAuthenticationCollector} The constructed FidoAuthenticationCollector object.
 */
export function returnFidoAuthenticationCollector(field: FidoAuthenticationField, idx: number) {
  return returnObjectValueAutoCollector(field, idx, 'FidoAuthenticationCollector');
}

/**
 * @function returnMultiValueCollector - Creates a MultiValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the MultiValueCollector.
 * @param {MultiValueCollectorTypes} [collectorType] - Optional type of the MultiValueCollector.
 * @returns {MultiValueCollector} The constructed MultiValueCollector object.
 */
export function returnMultiValueCollector<
  Field extends MultiSelectField,
  CollectorType extends MultiValueCollectorTypes = 'MultiValueCollector',
>(field: Field, idx: number, collectorType: CollectorType, data?: string[]) {
  let error = '';
  if (!('key' in field)) {
    error = `${error}Key is not found in the field object. `;
  }
  if (!('label' in field)) {
    error = `${error}Label is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }
  if (!('options' in field)) {
    error = `${error}Options are not found in the field object. `;
  }

  const validationArray = [];
  if ('required' in field && field.required === true) {
    validationArray.push({
      type: 'required',
      message: 'Value cannot be empty',
      rule: true,
    });
  }

  return {
    category: 'MultiValueCollector',
    error: error || null,
    type: collectorType || 'MultiValueCollector',
    id: `${field.key}-${idx}`,
    name: field.key,
    input: {
      key: field.key,
      value: data || [],
      type: field.type,
      validation: validationArray.length ? validationArray : null,
    },
    output: {
      key: field.key,
      label: field.label,
      type: field.type,
      value: data || [],
      options: field.options || [],
    },
  } as InferMultiValueCollectorType<CollectorType>;
}

/**
 * @function returnMultiSelectCollector - Creates a DropDownCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the DropDownCollector.
 * @returns {SingleValueCollector} The constructed DropDownCollector object.
 */
export function returnMultiSelectCollector(field: MultiSelectField, idx: number, data: string[]) {
  return returnMultiValueCollector(field, idx, 'MultiSelectCollector', data);
}

/**
 * @function returnObjectCollector - Creates a ObjectCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ObjectCollector.
 * @param {ObjectValueCollectorTypes} [collectorType] - Optional type of the ObjectCollector.
 * @returns {ObjectCollector} The constructed ObjectCollector object.
 */
export function returnObjectCollector<
  Field extends
    | DeviceAuthenticationField
    | DeviceRegistrationField
    | PhoneNumberField
    | PhoneNumberExtensionField,
  CollectorType extends ObjectValueCollectorTypes = 'ObjectValueCollector',
>(
  field: Field,
  idx: number,
  collectorType: CollectorType,
  prefillData?: PhoneNumberOutputValue | PhoneNumberExtensionOutputValue,
) {
  let error = '';
  if (!('key' in field)) {
    error = `${error}Key is not found in the field object. `;
  }
  if (!('label' in field)) {
    error = `${error}Label is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  const validationArray = [];
  if ('required' in field && field.required === true) {
    validationArray.push({
      type: 'required',
      message: 'Value cannot be empty',
      rule: true,
    });
  }

  let options;
  let defaultValue;
  let extensionLabel: string | null = null;

  if (field.type === 'DEVICE_AUTHENTICATION') {
    if (!('options' in field)) {
      error = `${error}Device options are not found in the field object. `;
    }
    if (Array.isArray(field.options) && field.options.length === 0) {
      error = `${error}Device options are not an array or is empty. `;
    }

    const unmappedDefault = field.options?.find((device) => device.default);
    defaultValue = {
      type: unmappedDefault ? unmappedDefault.type : '',
      value: unmappedDefault ? unmappedDefault.description : '',
      id: unmappedDefault ? unmappedDefault.id : '',
    };

    // Map DaVinci spec to normalized SDK API
    options =
      field.options?.map((device) => ({
        type: device.type,
        label: device.title,
        content: device.description,
        value: device.id,
        key: device.id,
        default: device.default,
      })) ?? [];
  } else if (field.type === 'DEVICE_REGISTRATION') {
    if (!('options' in field)) {
      error = `${error}Device options are not found in the field object. `;
    }
    if (Array.isArray(field.options) && field.options.length === 0) {
      error = `${error}Device options are not an array or is empty. `;
    }

    defaultValue = '';

    // Map DaVinci spec to normalized SDK API
    options =
      field.options?.map((device, idx) => ({
        type: device.type,
        label: device.title,
        content: device.description,
        value: device.type,
        key: `${device.type}-${idx}`,
      })) ?? [];
  } else if (field.type === 'PHONE_NUMBER') {
    if ('validatePhoneNumber' in field && field.validatePhoneNumber === true) {
      validationArray.push({
        type: 'validatePhoneNumber',
        message: 'Phone number should be validated',
        rule: true,
      });
    }

    const prefilledCountryCode = prefillData?.countryCode;
    const prefilledPhone = prefillData?.phoneNumber;

    if ('showExtension' in field && field.showExtension === true) {
      const prefilledExtension =
        prefillData && 'extension' in prefillData ? prefillData.extension : '';

      // PhoneNumberExtensionCollector default value
      defaultValue = {
        countryCode: prefilledCountryCode ? prefilledCountryCode : field.defaultCountryCode || '',
        phoneNumber: prefilledPhone || '',
        extension: prefilledExtension ?? '',
      };

      extensionLabel = field.extensionLabel;
    } else {
      // PhoneNumberCollector default value
      defaultValue = {
        countryCode: prefilledCountryCode ? prefilledCountryCode : field.defaultCountryCode || '',
        phoneNumber: prefilledPhone || '',
      };
    }
  }

  return {
    category: 'ObjectValueCollector',
    error: error || null,
    type: collectorType || 'ObjectValueCollector',
    id: `${field.key}-${idx}`,
    name: field.key,
    input: {
      key: field.key,
      value: defaultValue,
      type: field.type,
      validation: validationArray.length ? validationArray : null,
    },
    output: {
      key: field.key,
      label: field.label,
      type: field.type,
      ...(options && { options: options || [] }),
      ...(extensionLabel !== null && { extensionLabel }),
      ...(defaultValue && { value: defaultValue }),
    },
  } as InferValueObjectCollectorType<CollectorType>;
}

/**
 * @function returnObjectSelectCollector - Creates a DropDownCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the DropDownCollector.
 * @returns {SingleValueCollector} The constructed DropDownCollector object.
 */
export function returnObjectSelectCollector(
  field: DeviceAuthenticationField | DeviceRegistrationField,
  idx: number,
) {
  return returnObjectCollector(
    field,
    idx,
    field.type === 'DEVICE_AUTHENTICATION'
      ? 'DeviceAuthenticationCollector'
      : 'DeviceRegistrationCollector',
  );
}

export function returnObjectValueCollector(
  field: PhoneNumberField | PhoneNumberExtensionField,
  idx: number,
  prefillData: PhoneNumberOutputValue | PhoneNumberExtensionOutputValue,
) {
  if ('showExtension' in field && field.showExtension === true) {
    return returnObjectCollector(
      field,
      idx,
      'PhoneNumberExtensionCollector',
      prefillData as PhoneNumberExtensionOutputValue,
    );
  }

  return returnObjectCollector(
    field,
    idx,
    'PhoneNumberCollector',
    prefillData as PhoneNumberOutputValue,
  );
}

/**
 * @function returnNoValueCollector - Creates a NoValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the NoValueCollector.
 * @param {NoValueCollectorTypes} [collectorType] - Optional type of the NoValueCollector.
 * @returns {NoValueCollector} The constructed NoValueCollector object.
 */
export function returnNoValueCollector<
  Field extends ReadOnlyFields,
  CollectorType extends NoValueCollectorTypes = 'NoValueCollector',
>(field: Field, idx: number, collectorType: CollectorType) {
  let error = '';
  if (!('content' in field)) {
    error = `${error}Content is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  return {
    category: 'NoValueCollector',
    error: error || null,
    type: collectorType || 'NoValueCollector',
    id: `${field.key || field.type}-${idx}`,
    name: `${field.key || field.type}-${idx}`,
    output: {
      key: `${field.key || field.type}-${idx}`,
      label: field.content,
      type: field.type,
    },
  } as InferNoValueCollectorType<CollectorType>;
}

/**
 * @function returnReadOnlyCollector - Creates a `ReadOnlyCollector` (plain text) or
 * `RichTextCollector` (template + link replacements) depending on whether the field
 * carries a `richContent` payload.
 *
 * @param {ReadOnlyField} field - The LABEL field from the API response.
 * @param {number} idx - The index to be used in the id of the collector.
 * @returns {ReadOnlyCollector | RichTextCollector} The constructed collector.
 */
export function returnReadOnlyCollector(
  field: ReadOnlyField | AgreementField,
  idx: number,
): ReadOnlyCollector | RichTextCollector {
  if (field.type === 'LABEL' && field.richContent) {
    const base = returnNoValueCollector(field, idx, 'RichTextCollector');
    return {
      ...base,
      output: {
        ...base.output,
        content: field.content,
        richContent: {
          content: field.richContent.content,
          replacements: normalizeReplacements(field.richContent.replacements ?? {}),
        },
      },
    };
  }

  const base = returnNoValueCollector(field, idx, 'ReadOnlyCollector');
  return {
    ...base,
    output: {
      ...base.output,
      content: field.content,
      ...(field.type === 'AGREEMENT' && field.titleEnabled && { title: field.title ?? '' }),
    },
  };
}

/**
 * @function returnQrCodeCollector - Creates a QrCodeCollector object for displaying QR code images.
 * @param {QrCodeField} field - The field object containing key, content, type, and optional fallbackText.
 * @param {number} idx - The index to be used in the id of the QrCodeCollector.
 * @returns {QrCodeCollector} The constructed QrCodeCollector object.
 */
export function returnQrCodeCollector(field: QrCodeField, idx: number): QrCodeCollector {
  const base = returnNoValueCollector(field, idx, 'QrCodeCollector');

  return {
    ...base,
    output: {
      ...base.output,
      label: field.fallbackText || '',
      src: field.content || '',
    },
  };
}

/**
 * @function returnValidator - Creates a validator function based on the provided collector
 * @param {ValidatedTextCollector | | ValidatedBooleanCollector | ObjectValueCollectors | MultiValueCollectors | AutoCollectors} collector - The collector to which the value will be validated
 * @returns {function} - A "validator" function that validates the input value
 */
export function returnValidator<
  T extends
    | ValidatedTextCollector
    | ValidatedBooleanCollector
    | ObjectValueCollectors
    | MultiValueCollectors
    | AutoCollectors,
>(collector: T): Validator<T> {
  const rules = collector.input.validation;
  return (value: CollectorValueType<T>) => {
    return (
      rules?.reduce((acc, next) => {
        if (next.type === 'required') {
          if (
            !value ||
            (Array.isArray(value) && !value.length) ||
            (typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length)
          ) {
            acc.push(next.message);
          }
        } else if (next.type === 'regex' && typeof value === 'string') {
          try {
            const result = new RegExp(next.rule).test(value);
            if (!result) {
              acc.push(next.message);
            }
          } catch (err) {
            const error = err as Error;
            acc.push(error.message);
          }
        }
        return acc;
      }, [] as string[]) ?? []
    );
  };
}

export function returnUnknownCollector(field: Record<string, unknown>, idx: number) {
  return {
    category: 'UnknownCollector',
    error: 'Detected an unknown or unsupported collector type',
    type: field['type'],
    id: `${field['key'] || field['type']}-${idx}`,
    name: field['key'] || field['type'],
    output: {
      key: `${field['key'] || field['type']}-${idx}`,
      label: field['label'] || field['content'],
      type: field['type'],
    },
  } as UnknownCollector;
}
