import type { SingleSelectCollector, Updater } from '@forgerock/davinci-client/types';

/**
 * Creates a dropdown component based on the provided data and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the dropdown to
 * @param {SingleSelectCollector} collector - Contains the dropdown options and configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function dropdownComponent(
  formEl: HTMLFormElement,
  collector: SingleSelectCollector,
  updater: Updater,
) {
  // Create the label element
  const labelEl = document.createElement('label');
  labelEl.textContent = collector.output.label || 'Select an option';
  labelEl.className = 'dropdown-label';

  // Create the select element
  const selectEl = document.createElement('select');
  selectEl.name = collector.output.key || 'dropdown-field';
  selectEl.id = collector.output.key || 'dropdown-field';

  // Add a default/placeholder option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Please select...';
  defaultOption.selected = true;
  selectEl.appendChild(defaultOption);

  // Add all options from the data
  for (const option of collector.output.options) {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    selectEl.appendChild(optionEl);
  }

  // Add change event listener
  selectEl.addEventListener('change', (event) => {
    // Properly type the event target
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    updater(selectedValue); // Call the updater with the selected value
  });

  // Append elements to the form
  formEl.appendChild(labelEl);
  formEl.appendChild(selectEl);

  // Add some basic styling
  const style = document.createElement('style');
  style.textContent = `
    .dropdown-label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    select {
      padding: 8px;
      width: 100%;
      border-radius: 4px;
      border: 1px solid #ccc;
      margin-bottom: 15px;
    }
  `;
  document.head.appendChild(style);
}
