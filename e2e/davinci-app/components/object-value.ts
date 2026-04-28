/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  DeviceAuthenticationCollector,
  DeviceRegistrationCollector,
  PhoneNumberCollector,
  PhoneNumberExtensionCollector,
  PhoneNumberExtensionInputValue,
  PhoneNumberInputValue,
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
  collector:
    | DeviceRegistrationCollector
    | DeviceAuthenticationCollector
    | PhoneNumberCollector
    | PhoneNumberExtensionCollector,
  updater:
    | Updater<DeviceRegistrationCollector>
    | Updater<DeviceAuthenticationCollector>
    | Updater<PhoneNumberCollector>
    | Updater<PhoneNumberExtensionCollector>,
  submitForm: () => void,
) {
  if (
    collector.type === 'DeviceAuthenticationCollector' ||
    collector.type === 'DeviceRegistrationCollector'
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
      buttonEl.setAttribute('type', 'button');

      // Add change event listener
      buttonEl.addEventListener('click', (event) => {
        // Properly type the event target
        const target = event.target as HTMLButtonElement;
        const selectedValue = target.getAttribute('data-id');

        if (!selectedValue) {
          console.error('No value found for the selected option');
          return;
        }
        updater(selectedValue as any);
        submitForm();
      });

      buttonEl.setAttribute('data-id', option.value);
      buttonEl.textContent = option.label;
      formEl.appendChild(buttonEl);
    }
  } else if (collector.type === 'PhoneNumberCollector') {
    const phoneLabel = document.createElement('label');
    phoneLabel.textContent = collector.output.label || 'Phone Number';
    phoneLabel.className = 'object-options-title';
    phoneLabel.setAttribute('for', 'phone-number-input');

    const phoneInput = document.createElement('input');
    phoneInput.setAttribute('type', 'tel');
    phoneInput.setAttribute('id', 'phone-number-input');
    phoneInput.setAttribute('name', 'phone-number-input');
    phoneInput.setAttribute('placeholder', 'Enter phone number');

    formEl.appendChild(phoneLabel);
    formEl.appendChild(phoneInput);

    // Add change event listener
    phoneInput.addEventListener('change', (event) => {
      // Properly type the event target
      const target = event.target as HTMLInputElement;
      const selectedValue = target.value;

      if (!selectedValue) {
        console.error('No value found for the selected option');
        return;
      }

      const phoneNumberInputValue: PhoneNumberInputValue = {
        phoneNumber: selectedValue,
        countryCode: collector.output.value?.countryCode || '',
      };
      const phoneNumberUpdater = updater as Updater<PhoneNumberCollector>;
      phoneNumberUpdater(phoneNumberInputValue);
    });
  } else if (collector.type === 'PhoneNumberExtensionCollector') {
    const phoneLabel = document.createElement('label');
    phoneLabel.textContent = collector.output.label || 'Phone Number';
    phoneLabel.className = 'object-options-title';
    phoneLabel.setAttribute('for', 'phone-number-input-1');

    const phoneInput = document.createElement('input');
    phoneInput.setAttribute('type', 'tel');
    phoneInput.setAttribute('id', 'phone-number-input-1');
    phoneInput.setAttribute('name', 'phone-number-input-1');
    phoneInput.setAttribute('placeholder', 'Enter phone number');

    const extensionLabel = document.createElement('label');
    extensionLabel.textContent = collector.output.options.extensionLabel || 'Extension';
    extensionLabel.className = 'object-options-title';
    extensionLabel.setAttribute('for', 'extension-input-1');

    const extensionInput = document.createElement('input');
    extensionInput.setAttribute('type', 'text');
    extensionInput.setAttribute('id', 'extension-input-1');
    extensionInput.setAttribute('name', 'extension-input-1');
    extensionInput.setAttribute('placeholder', 'Enter extension');

    const divEl = document.createElement('div');
    divEl.style = 'display: flex; gap: 8px;';
    divEl.appendChild(phoneLabel);
    divEl.appendChild(phoneInput);
    divEl.appendChild(extensionLabel);
    divEl.appendChild(extensionInput);

    formEl.appendChild(divEl);

    const phoneNumberExtensionUpdater = updater as Updater<PhoneNumberExtensionCollector>;

    // Add change event listener for phone number input
    phoneInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const phoneValue = target.value;
      const extensionValue = extensionInput.value;

      if (!phoneValue) {
        console.error('No value found for phone number');
        return;
      }

      const phoneNumberExtensionInputValue: PhoneNumberExtensionInputValue = {
        phoneNumber: phoneValue,
        countryCode: collector.output.value?.countryCode || '',
        extension: extensionValue,
      };

      phoneNumberExtensionUpdater(phoneNumberExtensionInputValue);
    });

    // Add change event listener for extension input
    extensionInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const extensionValue = target.value;
      const phoneValue = phoneInput.value;

      if (!extensionValue) {
        console.error('No value found for extension');
        return;
      }

      const phoneNumberExtensionInputValue: PhoneNumberExtensionInputValue = {
        phoneNumber: phoneValue,
        countryCode: collector.output.value?.countryCode || '',
        extension: extensionValue,
      };

      phoneNumberExtensionUpdater(phoneNumberExtensionInputValue);
    });
  }
}
