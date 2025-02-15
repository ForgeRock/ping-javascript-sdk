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
} from './collector.types.js';
import type {
  MultiSelectFieldValue,
  ReadOnlyFieldValue,
  RedirectFieldValue,
  SingleSelectFieldValue,
  StandardFieldValue,
  ValidatedFieldValue,
} from './davinci.types.js';

/**
 * @function returnActionCollector - Creates an ActionCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ActionCollector.
 * @param {ActionCollectorTypes} [collectorType] - Optional type of the ActionCollector.
 * @returns {ActionCollector} The constructed ActionCollector object.
 */
export function returnActionCollector<CollectorType extends ActionCollectorTypes>(
  field: RedirectFieldValue | StandardFieldValue,
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
export function returnFlowCollector(field: StandardFieldValue, idx: number) {
  return returnActionCollector(field, idx, 'FlowCollector');
}

/**
 * @function returnIdpCollector - Returns a social login collector object
 * @param {DaVinciField} field - The field representing the social login button
 * @param {number} idx - The index of the field in the form
 * @returns {SocialLoginCollector} - The social login collector object
 */
export function returnIdpCollector(field: RedirectFieldValue, idx: number) {
  return returnActionCollector(field, idx, 'IdpCollector');
}

/**
 * @function returnSubmitCollector - Returns a submit collector object
 * @param {DaVinciField} field - The field representing the submit button
 * @param {number} idx - The index of the field in the form
 * @returns {ActionCollector} - The submit collector object
 */
export function returnSubmitCollector(field: StandardFieldValue, idx: number) {
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
  Field extends StandardFieldValue | SingleSelectFieldValue | ValidatedFieldValue,
  CollectorType extends SingleValueCollectorTypes = 'SingleValueCollector',
>(field: Field, idx: number, collectorType: CollectorType, data?: string) {
  let error = '';
  console.log('the field ', field);
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
    } as InferSingleValueCollectorType<CollectorType>;
  } else if ('validation' in field || 'required' in field) {
    const validationArray = [];

    if ('validation' in field) {
      validationArray.push({
        type: 'regex',
        message: field.validation?.errorMessage || '',
        rule: field.validation?.regex || '',
      });
    }
    if ('required' in field) {
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
        value: '',
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
 * @function returnPasswordCollector - Creates a PasswordCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the PasswordCollector.
 * @returns {PasswordCollector} The constructed PasswordCollector object.
 */
export function returnPasswordCollector(field: StandardFieldValue, idx: number) {
  return returnSingleValueCollector(field, idx, 'PasswordCollector');
}

/**
 * @function returnTextCollector - Creates a TextCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the TextCollector.
 * @returns {TextCollector} The constructed TextCollector object.
 */
export function returnTextCollector(field: StandardFieldValue, idx: number, data: string) {
  return returnSingleValueCollector(field, idx, 'TextCollector', data);
}
/**
 * @function returnSingleSelectCollector - Creates a SingleCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the SingleCollector.
 * @returns {SingleValueCollector} The constructed SingleCollector object.
 */
export function returnSingleSelectCollector(
  field: SingleSelectFieldValue,
  idx: number,
  data: string,
) {
  return returnSingleValueCollector(field, idx, 'SingleSelectCollector', data);
}

/**
 * @function returnMultiValueCollector - Creates a MultiValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the MultiValueCollector.
 * @param {MultiValueCollectorTypes} [collectorType] - Optional type of the MultiValueCollector.
 * @returns {MultiValueCollector} The constructed MultiValueCollector object.
 */
export function returnMultiValueCollector<
  Field extends MultiSelectFieldValue,
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

  return {
    category: 'MultiValueCollector',
    error: error || null,
    type: collectorType || 'MultiValueCollector',
    id: `${field.key}-${idx}`,
    name: field.key,
    input: {
      key: field.key,
      value: [],
      type: field.type,
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
export function returnMultiSelectCollector(
  field: MultiSelectFieldValue,
  idx: number,
  data: string[],
) {
  return returnMultiValueCollector(field, idx, 'MultiSelectCollector', data);
}

/**
 * @function returnMultiValueCollector - Creates a MultiValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the MultiValueCollector.
 * @param {MultiValueCollectorTypes} [collectorType] - Optional type of the MultiValueCollector.
 * @returns {MultiValueCollector} The constructed MultiValueCollector object.
 */
export function returnNoValueCollector<
  Field extends ReadOnlyFieldValue,
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
 * @function returnMultiSelectCollector - Creates a DropDownCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the DropDownCollector.
 * @returns {SingleValueCollector} The constructed DropDownCollector object.
 */
export function returnReadOnlyCollector(field: ReadOnlyFieldValue, idx: number) {
  return returnNoValueCollector(field, idx, 'ReadOnlyCollector');
}

/**
 * @function returnValidator - Creates a validator function based on the provided collector
 * @param collector {ValidatedTextCollector} - The collector to which the value will be validated
 * @returns {function} - A "validator" function that validates the input value
 */
export function returnValidator(collector: ValidatedTextCollector) {
  const rules = collector.input.validation;
  return (value: string) => {
    return rules.reduce((acc, next) => {
      if (next.type === 'required' && !value) {
        acc.push(next.message);
      } else if (next.type === 'regex') {
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
    }, [] as string[]);
  };
}
