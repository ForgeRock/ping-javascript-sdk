import type { SingleSelectCollector, Updater } from '@forgerock/davinci-client/types';

/**
 * Creates a group of checkboxes with single-select behavior (like radio buttons)
 * based on the provided data and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the checkboxes to
 * @param {SingleSelectCollector} collector - Contains the options and configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function checkboxComponent(
  formEl: HTMLFormElement,
  collector: SingleSelectCollector,
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

  // Track the currently selected checkbox
  let selectedCheckbox: HTMLInputElement | null = null;

  // Create checkboxes for each option
  for (const option of collector.output.options) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${collector.output.key}-${option.value}`;
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
        // Uncheck the previously selected checkbox if there was one
        if (selectedCheckbox && selectedCheckbox !== target) {
          selectedCheckbox.checked = false;
        }

        // Update the selected checkbox reference
        selectedCheckbox = target;

        console.log(event.target);
        // Call the updater with the selected value
        updater(target.value);
      } else {
        // If the user is trying to uncheck the selected checkbox,
        // prevent that to maintain a selected state
        target.checked = true;
      }
    });

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    containerDiv.appendChild(wrapper);
  }

  // Append the container to the form
  formEl.appendChild(containerDiv);

  // Add some basic styling
  const style = document.createElement('style');
  style.textContent = `
    .checkbox-container {
      margin-bottom: 15px;
    }

    .checkbox-group-label {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .checkbox-wrapper {
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }

    .checkbox-wrapper input[type="checkbox"] {
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);
}
