import type { MultiSelectCollector, Updater } from '@forgerock/davinci-client/types';

/**
 * Creates a dropdown component that allows selecting multiple options
 * from a predefined list
 * @param {HTMLFormElement} formEl - The form element to attach the multi-select to
 * @param {SingleSelectCollector} collector - Contains the options and configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function multiSelectDropdownComponent(
  formEl: HTMLFormElement,
  collector: MultiSelectCollector,
  updater: Updater,
) {
  // Create a container for the multi-select
  const containerDiv = document.createElement('div');
  containerDiv.className = 'multi-select-container';

  // Create a label for the multi-select
  const label = document.createElement('label');
  label.textContent = collector.output.label || 'Select options';
  label.className = 'multi-select-label';
  label.setAttribute('for', 'combobox');
  containerDiv.appendChild(label);

  const selectEl = document.createElement('select');
  selectEl.textContent = collector.output.label;
  selectEl.multiple = true;
  selectEl.className = 'select-option-combobox';
  containerDiv.appendChild(selectEl);
  const selectedElements: Set<string> = new Set();
  /**
   * This is a really hard thing to properly listen to
   * this is because its hard to track which options are selected
   * and which are not selected due to the nature of the element
   * becauase this is purly a test app, I dont view this as mission critical.
   * For testing purposes we will just ensure when we select two elements one after the other
   * that the multi-value collector does respect both.
   */
  selectEl.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLSelectElement;
    console.log('The target ', target.value);
    if (selectedElements.has(target.value)) {
      selectedElements.delete(target.value);
    } else {
      selectedElements.add(target.value);
    }
    updater(Array.from(selectedElements));
  });

  for (const option of collector.output.options) {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.label = option.label;

    selectEl.appendChild(optionEl);
  }

  formEl.appendChild(containerDiv);
}
