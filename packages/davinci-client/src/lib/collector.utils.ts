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
  AutoCollectorTypes,
  UnknownCollector,
  InferAutoCollectorType,
  PhoneNumberOutputValue,
  MultiValueCollectors,
  ObjectValueCollectors,
} from './collector.types.js';
import type {
  DeviceAuthenticationField,
  DeviceRegistrationField,
  MultiSelectField,
  PhoneNumberField,
  ProtectField,
  ReadOnlyField,
  RedirectField,
  SingleSelectField,
  StandardField,
  ValidatedField,
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
 * @function returnAutoCollector - Creates an AutoCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the AutoCollector.
 * @param {AutoCollectorTypes} [collectorType] - Optional type of the AutoCollector.
 * @returns {AutoCollector} The constructed AutoCollector object.
 */
export function returnAutoCollector<
  Field extends ProtectField,
  CollectorType extends AutoCollectorTypes = 'SingleValueAutoCollector',
>(field: Field, idx: number, collectorType: CollectorType, data?: string) {
  let error = '';
  if (!('key' in field)) {
    error = `${error}Key is not found in the field object. `;
  }
  if (!('type' in field)) {
    error = `${error}Type is not found in the field object. `;
  }

  if (collectorType === 'ProtectCollector') {
    return {
      category: 'SingleValueAutoCollector',
      error: error || null,
      type: collectorType,
      id: `${field?.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: data || '',
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
  } else {
    return {
      category: 'SingleValueAutoCollector',
      error: error || null,
      type: collectorType || 'SingleValueAutoCollector',
      id: `${field.key}-${idx}`,
      name: field.key,
      input: {
        key: field.key,
        value: data || '',
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
export function returnProtectCollector(field: ProtectField, idx: number, data: string) {
  return returnAutoCollector(field, idx, 'ProtectCollector', data);
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
      validation: validationArray.length ? validationArray : undefined,
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

    const unmappedDefault = field.options.find((device) => device.default);
    defaultValue = {
      type: unmappedDefault ? unmappedDefault.type : '',
      value: unmappedDefault ? unmappedDefault.description : '',
      id: unmappedDefault ? unmappedDefault.id : '',
    };

    // Map DaVinci spec to normalized SDK API
    options = field.options.map((device) => ({
      type: device.type,
      label: device.title,
      content: device.description,
      value: device.id,
      key: device.id,
      default: device.default,
    }));
  } else if (field.type === 'DEVICE_REGISTRATION') {
    if (!('options' in field)) {
      error = `${error}Device options are not found in the field object. `;
    }

    if (Array.isArray(field.options) && field.options.length === 0) {
      error = `${error}Device options are not an array or is empty. `;
    }

    defaultValue = '';

    // Map DaVinci spec to normalized SDK API
    options = field.options.map((device, idx) => ({
      type: device.type,
      label: device.title,
      content: device.description,
      value: device.type,
      key: `${device.type}-${idx}`,
    }));
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
      validation: validationArray.length ? validationArray : undefined,
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
 * @function returnNoValueCollector - Creates a NoValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the NoValueCollector.
 * @param {NoValueCollectorTypes} [collectorType] - Optional type of the NoValueCollector.
 * @returns {NoValueCollector} The constructed NoValueCollector object.
 */
export function returnNoValueCollector<
  Field extends ReadOnlyField,
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
 * @function returnReadOnlyCollector - Creates a ReadOnlyCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ReadOnlyCollector.
 * @returns {ReadOnlyCollector} The constructed ReadOnlyCollector object.
 */
export function returnReadOnlyCollector(field: ReadOnlyField, idx: number) {
  return returnNoValueCollector(field, idx, 'ReadOnlyCollector');
}

/**
 * @function returnValidator - Creates a validator function based on the provided collector
 * @param {ValidatedTextCollector | ObjectValueCollectors | MultiValueCollectors} collector - The collector to which the value will be validated
 * @returns {function} - A "validator" function that validates the input value
 */
export function returnValidator(
  collector: ValidatedTextCollector | ObjectValueCollectors | MultiValueCollectors,
) {
  const rules = collector.input.validation;
  return (value: string | string[] | Record<string, string>) => {
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
