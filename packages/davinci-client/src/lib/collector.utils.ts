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
} from './collector.types';
import type {
  DaVinciField,
  MultiSelect,
  SingleSelect,
  StandardFieldValue,
} from './davinci.types.js';

/**
 * @function returnActionCollector - Creates an ActionCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ActionCollector.
 * @param {ActionCollectorTypes} [collectorType] - Optional type of the ActionCollector.
 * @returns {ActionCollector} The constructed ActionCollector object.
 */
export function returnActionCollector<CollectorType extends ActionCollectorTypes>(
  field: StandardFieldValue,
  idx: number,
  collectorType: CollectorType,
): ActionCollectors {
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

  if (collectorType === 'SocialLoginCollector') {
    return {
      category: 'ActionCollector',
      error: error || null,
      type: collectorType,
      id: `${field.key}-${idx}`,
      name: field.key,
      output: {
        key: field.key,
        label: field.label,
        type: field.type,
        url: field.links?.['authenticate']?.href || null,
      },
    } as InferActionCollectorType<CollectorType>;
  } else {
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
 * @function returnSocialLoginCollector - Returns a social login collector object
 * @param {DaVinciField} field - The field representing the social login button
 * @param {number} idx - The index of the field in the form
 * @returns {SocialLoginCollector} - The social login collector object
 */
export function returnSocialLoginCollector(field: StandardFieldValue, idx: number) {
  return returnActionCollector(field, idx, 'SocialLoginCollector');
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
  Field extends DaVinciField,
  CollectorType extends SingleValueCollectorTypes = 'SingleValueCollector',
>(field: Field, idx: number, collectorType: CollectorType) {
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
      id: `${field?.key || field.type}-${idx}`,
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
        value: '',
        options: options,
      },
    } as InferSingleValueCollectorType<CollectorType>;
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
        value: '',
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
export function returnTextCollector(field: StandardFieldValue, idx: number) {
  return returnSingleValueCollector(field, idx, 'TextCollector');
}
/**
 * @function returnSingleSelectCollector - Creates a SingleCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the SingleCollector.
 * @returns {SingleValueCollector} The constructed SingleCollector object.
 */
export function returnSingleSelectCollector(field: SingleSelect, idx: number) {
  return returnSingleValueCollector(field, idx, 'SingleSelectCollector');
}

/**
 * @function returnMultiValueCollector - Creates a MultiValueCollector object based on the provided field, index, and optional collector type.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the MultiValueCollector.
 * @param {MultiValueCollectorTypes} [collectorType] - Optional type of the MultiValueCollector.
 * @returns {MultiValueCollector} The constructed MultiValueCollector object.
 */
export function returnMultiValueCollector<
  Field extends MultiSelect,
  CollectorType extends MultiValueCollectorTypes = 'MultiValueCollector',
>(field: Field, idx: number, collectorType: CollectorType) {
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
      value: [],
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
export function returnMultiSelectCollector(field: MultiSelect, idx: number) {
  return returnMultiValueCollector(field, idx, 'MultiSelectCollector');
}
