/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the required types
 */
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
  QrCodeCollectorBase,
  AgreementCollector,
  ValidatedReplacement,
  ValidateReplacementsResult,
  ReadOnlyCollectorBase,
} from './collector.types.js';
import type {
  DeviceAuthenticationField,
  DeviceRegistrationField,
  FidoAuthenticationField,
  FidoRegistrationField,
  MultiSelectField,
  PhoneNumberField,
  ProtectField,
  QrCodeField,
  PollingField,
  ReadOnlyField,
  RedirectField,
  RichContentReplacement,
  SingleSelectField,
  StandardField,
  ValidatedField,
  AgreementField,
  ReadOnlyFields,
} from './davinci.types.js';

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
  Field extends StandardField | SingleSelectField | ValidatedField,
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
        // No default or existing value is passed
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
  } else if ('validation' in field || 'required' in field) {
    const validationArray = [];

    if ('validation' in field) {
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
 * @function returnPasswordCollector - Creates a PasswordCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the PasswordCollector.
 * @returns {PasswordCollector} The constructed PasswordCollector object.
 */
export function returnPasswordCollector(field: StandardField, idx: number) {
  return returnSingleValueCollector(field, idx, 'PasswordCollector');
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
  Field extends DeviceAuthenticationField | DeviceRegistrationField | PhoneNumberField,
  CollectorType extends ObjectValueCollectorTypes = 'ObjectValueCollector',
>(field: Field, idx: number, collectorType: CollectorType, prefillData?: PhoneNumberOutputValue) {
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
    defaultValue = {
      countryCode: prefilledCountryCode ? prefilledCountryCode : field.defaultCountryCode || '',
      phoneNumber: prefilledPhone || '',
    };
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
  field: PhoneNumberField,
  idx: number,
  prefillData: PhoneNumberOutputValue,
) {
  return returnObjectCollector(field, idx, 'PhoneNumberCollector', prefillData);
}

/**
 * @function validateReplacements - Validates replacement hrefs and converts the
 * Record<string, RichContentReplacement> from the API response into a ValidatedReplacement[].
 * Returns a discriminated result — never throws.
 *
 * @param {Record<string, RichContentReplacement>} replacements - The replacements object from the API.
 * @returns {ValidateReplacementsResult} Success with validated array, or failure with error message.
 */
export function validateReplacements(
  replacements: Record<string, RichContentReplacement>,
): ValidateReplacementsResult {
  const validated: ValidatedReplacement[] = [];

  for (const [key, replacement] of Object.entries(replacements)) {
    let href: URL;
    try {
      href = new URL(replacement.href);
    } catch {
      return { ok: false, error: `Invalid href for key: ${key}` };
    }
    if (!['https:', 'http:'].includes(href.protocol)) {
      return { ok: false, error: `Unsafe href protocol for key: ${key}` };
    }

    validated.push({
      key,
      type: replacement.type,
      value: replacement.value,
      href: replacement.href,
      ...(replacement.target && { target: replacement.target }),
    });
  }

  return { ok: true, replacements: validated };
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
 * @function returnReadOnlyCollector - Creates a ReadOnlyCollector with pass-through rich content.
 * When richContent is present, validates replacements and passes through the template.
 * When absent, richContent echoes the plain content with empty replacements.
 *
 * @param {ReadOnlyField} field - The LABEL field from the API response.
 * @param {number} idx - The index to be used in the id of the ReadOnlyCollector.
 * @returns {ReadOnlyCollectorBase} The constructed ReadOnlyCollector.
 */
export function returnReadOnlyCollector(field: ReadOnlyField, idx: number): ReadOnlyCollectorBase {
  const fieldErrors = [
    ...(!('content' in field) ? ['Content is not found in the field object.'] : []),
    ...(!('type' in field) ? ['Type is not found in the field object.'] : []),
  ];

  const id = `${field.key || field.type}-${idx}`;

  if (!field.richContent) {
    const errors = fieldErrors;
    return {
      category: 'NoValueCollector',
      error: errors.length > 0 ? errors.join(' ') : null,
      type: 'ReadOnlyCollector',
      id,
      name: id,
      output: {
        key: id,
        label: field.content,
        type: field.type,
        content: field.content,
        richContent: { content: field.content, replacements: [] },
      },
    };
  }

  // Validate that all {{key}} references in the template have corresponding replacements
  const templateKeys = [...field.richContent.content.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
  const apiReplacements = field.richContent.replacements ?? {};
  const missingKeys = templateKeys.filter((k) => !(k in apiReplacements));
  const templateErrors = missingKeys.map((k) => `Missing replacement for key: {{${k}}}`);

  const validationResult =
    templateErrors.length === 0 ? validateReplacements(apiReplacements) : null;

  const replacements = validationResult?.ok ? validationResult.replacements : [];
  const validationErrors = validationResult && !validationResult.ok ? [validationResult.error] : [];
  const errors = [...fieldErrors, ...templateErrors, ...validationErrors];

  return {
    category: 'NoValueCollector',
    error: errors.length > 0 ? errors.join(' ') : null,
    type: 'ReadOnlyCollector',
    id,
    name: id,
    output: {
      key: id,
      label: field.content,
      type: field.type,
      content: field.content,
      richContent: {
        content: field.richContent.content,
        replacements,
      },
    },
  };
}

/**
 * @function returnQrCodeCollector - Creates a QrCodeCollector object for displaying QR code images.
 * @param {QrCodeField} field - The field object containing key, content, type, and optional fallbackText.
 * @param {number} idx - The index to be used in the id of the QrCodeCollector.
 * @returns {QrCodeCollectorBase} The constructed QrCodeCollector object.
 */
export function returnQrCodeCollector(field: QrCodeField, idx: number): QrCodeCollectorBase {
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
 * @function returnAgreementCollector - Creates an AgreementCollector object based on the provided field and index.
 * @param {AgreementField} field - The field object containing key, label, type, and agreement details.
 * @param {number} idx - The index to be used in the id of the AgreementCollector.
 * @returns {AgreementCollector} The constructed AgreementCollector object.
 */
export function returnAgreementCollector(field: AgreementField, idx: number): AgreementCollector {
  const base = returnNoValueCollector(field, idx, 'AgreementCollector');
  return {
    ...base,
    output: {
      ...base.output,
      titleEnabled: field.titleEnabled,
      title: field.title,
      agreement: {
        id: field.agreement?.id ?? '',
        useDynamicAgreement: field.agreement?.useDynamicAgreement ?? false,
      },
      enabled: field.enabled ?? false,
    },
  };
}

/**
 * @function returnValidator - Creates a validator function based on the provided collector
 * @param {ValidatedTextCollector | ObjectValueCollectors | MultiValueCollectors | AutoCollectors} collector - The collector to which the value will be validated
 * @returns {function} - A "validator" function that validates the input value
 */
export function returnValidator(
  collector: ValidatedTextCollector | ObjectValueCollectors | MultiValueCollectors | AutoCollectors,
) {
  const rules = collector.input.validation;
  return (value: string | string[] | Record<string, unknown>) => {
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
