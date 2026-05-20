/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  ValidatedBooleanCollector,
  Updater,
  Validator,
} from '@forgerock/davinci-client/types';
import { dotToCamelCase, richContentInterpolation } from '../helper.js';

/**
 * Creates a single checkbox and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the checkbox to
 * @param {ValidatedBooleanCollector} collector - Contains the configuration
 * @param {Updater} updater - Function to call when selection changes
 * @param {Validator} validator - Function to validate the input
 */
export default function booleanComponent(
  formEl: HTMLFormElement,
  collector: ValidatedBooleanCollector,
  updater: Updater<ValidatedBooleanCollector>,
  validator: Validator<ValidatedBooleanCollector>,
) {
  const collectorKey = dotToCamelCase(collector.output.key);

  // Create a container for the checkbox
  const containerDiv = document.createElement('div');
  containerDiv.className = 'single-checkbox-container';

  // Create a single checkbox
  const wrapper = document.createElement('div');
  wrapper.className = 'checkbox-wrapper';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = collectorKey;
  checkbox.name = collectorKey;
  checkbox.checked = collector.output.value;
  checkbox.value = 'checked';

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;

  const { richContent } = collector.output;
  if (!richContent || richContent.replacements.length === 0) {
    label.textContent = collector.output.label;
  } else {
    const pRichText = richContentInterpolation(richContent);
    while (pRichText.firstChild) {
      label.appendChild(pRichText.firstChild);
    }
  }

  // Add event listener to handle single-select behavior
  checkbox.addEventListener('change', (event) => {
    const checked = (event.target as HTMLInputElement).checked;
    const result = validator(checked);
    const errorEl = formEl?.querySelector(`.${collectorKey}-error`);

    // Validate the input
    if (Array.isArray(result) && result.length && !errorEl) {
      const newErrorEl = document.createElement('div');
      newErrorEl.className = `${collectorKey}-error`;
      newErrorEl.innerText = result.join(', ');
      formEl?.querySelector(`#${collectorKey}`)?.after(newErrorEl);
    } else if (Array.isArray(result) && result.length) {
      return;
    } else {
      formEl.querySelector(`.${collectorKey}-error`)?.remove();
      const updateError = updater(checked);
      if (updateError && 'error' in updateError) {
        console.error(updateError.error.message);
      }
    }
  });

  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  containerDiv.appendChild(wrapper);

  // Append the container to the form
  formEl.appendChild(containerDiv);
}
