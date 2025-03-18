import type { SingleSelectCollector, Updater } from '@forgerock/davinci-client/types';

/**
 * Creates a group of radioes with single-select behavior (like radio buttons)
 * based on the provided data and attaches it to the form
 * @param {HTMLFormElement} formEl - The form element to attach the radioes to
 * @param {SingleSelectCollector} collector - Contains the options and configuration
 * @param {Updater} updater - Function to call when selection changes
 */
export default function radioComponent(
  formEl: HTMLFormElement,
  collector: SingleSelectCollector,
  updater: Updater,
) {
  // Create a container for the radioes
  const containerDiv = document.createElement('div');
  containerDiv.className = 'radio-container';

  // Create a heading/label for the radio group
  const groupLabel = document.createElement('div');
  groupLabel.textContent = collector.output.label || 'Select an option';
  groupLabel.className = 'radio-group-label';
  containerDiv.appendChild(groupLabel);

  // Track the currently selected radio
  let selectedRadio: HTMLInputElement | null = null;

  // Create radioes for each option
  for (const option of collector.output.options) {
    const wrapper = document.createElement('div');
    wrapper.className = 'radio-wrapper';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = `${collector.output.key}-${option.value}`;
    radio.name = collector.output.key || 'checkbox-field';
    radio.value = option.value;

    const label = document.createElement('label');
    label.htmlFor = radio.id;
    label.textContent = option.label;

    // Add event listener to handle single-select behavior
    radio.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;

      // If this radio is being checked
      if (target.checked) {
        // Uncheck the previously selected radio if there was one
        if (selectedRadio && selectedRadio !== target) {
          selectedRadio.checked = false;
        }

        // Update the selected radio reference
        selectedRadio = target;

        updater(target.value);
      } else {
        // If the user is trying to uncheck the selected radio,
        // prevent that to maintain a selected state
        target.checked = true;
      }
    });

    wrapper.appendChild(radio);
    wrapper.appendChild(label);
    containerDiv.appendChild(wrapper);
  }

  // Append the container to the form
  formEl.appendChild(containerDiv);

  // Add some basic styling
  const style = document.createElement('style');
  style.textContent = `
    .radio-container {
      margin-bottom: 15px;
    }

    .radio-group-label {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .radio-wrapper {
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }

    .radio-wrapper input[type="radio"] {
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);
}
