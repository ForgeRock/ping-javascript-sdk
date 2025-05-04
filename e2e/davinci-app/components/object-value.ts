/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  DeviceAuthenticationCollector,
  DeviceRegistrationCollector,
  Updater,
} from '@forgerock/davinci-client/types';

/**
 * Creates a dropdown component based on the provided data and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the dropdown to
 * @param {SingleSelectCollector} collector - Contains the dropdown options and configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function objectValueComponent(
  formEl: HTMLFormElement,
  collector: DeviceRegistrationCollector | DeviceAuthenticationCollector,
  updater: Updater,
  submitForm: () => void,
) {
  // Create the label element
  const paragraphEl = document.createElement('p');
  paragraphEl.textContent = collector.output.label || 'Select an option';
  paragraphEl.className = 'object-options-title';

  // Append elements to the form
  formEl.appendChild(paragraphEl);

  // Add all options from the data
  for (const option of collector.output.options) {
    const buttonEl = document.createElement('button');

    // Add change event listener
    buttonEl.addEventListener('click', (event) => {
      // Properly type the event target
      const target = event.target as HTMLButtonElement;
      const selectedValue = target.getAttribute('data-id');

      if (!selectedValue) {
        console.error('No value found for the selected option');
        return;
      }
      updater(selectedValue);
      submitForm();
    });

    buttonEl.setAttribute('data-id', option.value);
    buttonEl.textContent = option.label;
    formEl.appendChild(buttonEl);
  }
}
