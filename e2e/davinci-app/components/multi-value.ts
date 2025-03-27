import type { MultiSelectCollector, Updater } from '@forgerock/davinci-client/types';

/**
 * Creates a group of checkboxes with single-select behavior (like radio buttons)
 * based on the provided data and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the checkboxes to
 * @param {SingleSelectCollector} collector - Contains the options and configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function multiValueComponent(
  formEl: HTMLFormElement,
  collector: MultiSelectCollector,
  updater: Updater,
) {
  // Create a container for the checkboxes
  const containerDiv = document.createElement('div');
  containerDiv.className = 'checkbox-container';

  // Create a heading/label for the checkbox group
  const groupLabel = document.createElement('div');
  groupLabel.textContent = collector.output.label || 'Select an option';
  groupLabel.className = 'checkbox-group-label';
  containerDiv.appendChild(groupLabel);

  const values: string[] = [];
  let index = 0;

  // Create checkboxes for each option
  for (const option of collector.output.options) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';

    index += 1;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${collector.output.key}-${index}`;
    checkbox.name = collector.output.key || 'checkbox-field';
    checkbox.value = option.value;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = option.label;

    // Add event listener to handle single-select behavior
    checkbox.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;

      // If this checkbox is being checked
      if (target.checked) {
        values.push(target.value);
      } else {
        // If this checkbox is being unchecked
        const index = values.indexOf(target.value);
        if (index > -1) {
          values.splice(index, 1);
        }
      }
      console.log(values);
      updater(values);
    });

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    containerDiv.appendChild(wrapper);
  }

  // Append the container to the form
  formEl.appendChild(containerDiv);
}
