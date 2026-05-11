/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ValidatedBooleanCollector, Updater } from '@forgerock/davinci-client/types';

/**
 * Creates a single checkbox and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the checkboxes to
 * @param {ValidatedBooleanCollector} collector - Contains the configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function booleanComponent(
  formEl: HTMLFormElement,
  collector: ValidatedBooleanCollector,
  updater: Updater<ValidatedBooleanCollector>,
) {
  // Create a container for the checkboxes
  const containerDiv = document.createElement('div');
  containerDiv.className = 'single-checkbox-container';

  // Create a heading/label for the checkbox group
  const groupLabel = document.createElement('div');
  groupLabel.textContent = collector.output.label || 'Single Checkbox';
  groupLabel.className = 'single-checkbox-label';
  containerDiv.appendChild(groupLabel);

  // Create checkboxes for each option
  const wrapper = document.createElement('div');
  wrapper.className = 'checkbox-wrapper';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = collector.output.key;
  checkbox.name = collector.output.key || 'single-checkbox-field';
  checkbox.checked = collector.output.value;
  checkbox.value = 'checked';

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = collector.output.label;

  // Add event listener to handle single-select behavior
  checkbox.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    updater(target.checked);
  });

  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  containerDiv.appendChild(wrapper);

  // Append the container to the form
  formEl.appendChild(containerDiv);
}
