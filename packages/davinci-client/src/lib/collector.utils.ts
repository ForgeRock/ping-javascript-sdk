/**
 * Import the required types
 */
import type {
  ActionCollectors,
  ActionCollectorTypes,
  InferSingleValueCollectorFromSingleValueCollectorType,
  SingleValueCollectorTypes,
} from './collector.types';
import type {
  Combobox,
  DaVinciField,
  //LabelField,
  Radio,
  StandardFieldValue,
} from './davinci.types';

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
    };
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
    };
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
>(
  field: Field,
  idx: number,
  collectorType: CollectorType,
): InferSingleValueCollectorFromSingleValueCollectorType<CollectorType> {
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

  if (
    collectorType === 'PasswordCollector' ||
    collectorType === 'FlowLinkCollector'
    //collectorType === 'LabelCollector'
  ) {
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
    } as InferSingleValueCollectorFromSingleValueCollectorType<CollectorType>;
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
    } as InferSingleValueCollectorFromSingleValueCollectorType<CollectorType>;
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
 * @function returnRadioCollector - Creates a RadioCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the RadioCollector.
 * @returns {SingleValueCollector} The constructed RadioCollector object.
 */
export function returnRadioCollector(field: Radio, idx: number) {
  return returnSingleValueCollector(field, idx, 'RadioCollector');
}
/**
 * @function returnDropDownCollector - Creates a DropDownCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the DropDownCollector.
 * @returns {SingleValueCollector} The constructed DropDownCollector object.
 */
export function returnDropDownCollector(field: DaVinciField, idx: number) {
  return returnSingleValueCollector(field, idx, 'DropDownCollector');
}
/**
 * @function returnComboboxCollector - Creates a ComboboxCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the ComboboxCollector.
 * @returns {SingleValueCollector} The constructed ComboboxCollector object.
 */
export function returnComboboxCollector(field: Combobox, idx: number) {
  return returnSingleValueCollector(field, idx, 'ComboboxCollector');
}

/**
 * @function returnFlowLinkCollector - Creates a FlowLinkCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the FlowLinkCollector.
 * @returns {SingleValueCollector} The constructed FlowLinkCollector object.
 **/
export function returnFlowLinkCollector(field: DaVinciField, idx: number) {
  return returnSingleValueCollector(field, idx, 'FlowLinkCollector');
}

/**
 * @function returnLabelCollector - Creates a LabelCollector object based on the provided field and index.
 * @param {DaVinciField} field - The field object containing key, label, type, and links.
 * @param {number} idx - The index to be used in the id of the LabelCollector.
 * @returns {SingleValueCollector} The constructed LabelCollector object.
 **/
//export function returnLabelCollector(field: LabelField, idx: number) {
//  return returnSingleValueCollector(field, idx, 'LabelCollector');
//}
