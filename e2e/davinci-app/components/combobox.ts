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
  containerDiv.appendChild(label);

  // Create the main dropdown button
  const dropdownButton = document.createElement('button');
  dropdownButton.type = 'button';
  dropdownButton.className = 'multi-select-button';
  dropdownButton.textContent = 'Select options';

  // Create the dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'multi-select-dropdown';
  dropdown.style.display = 'none';

  // Store selected values
  const selectedValues: string[] = [];

  // Function to update selected options display
  const updateSelectionDisplay = () => {
    if (selectedValues.length === 0) {
      dropdownButton.textContent = 'Select options';
    } else {
      // Get labels for selected values
      const selectedLabels = collector.output.options
        .filter((option) => selectedValues.includes(option.value))
        .map((option) => option.label);

      if (selectedLabels.length <= 2) {
        dropdownButton.textContent = selectedLabels.join(', ');
      } else {
        dropdownButton.textContent = `${selectedLabels.length} options selected`;
      }
    }
  };

  // Function to update the updater with current selection
  const updateSelection = () => {
    // If single value, send as string, otherwise send as array
    if (selectedValues.length === 1) {
      updater(selectedValues[0]);
    } else {
      // FIXED: Pass the array directly instead of joining with commas
      updater(selectedValues);
    }
  };

  // Populate dropdown with options
  collector.output.options.forEach((option) => {
    const optionWrapper = document.createElement('div');
    optionWrapper.className = 'multi-select-option-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${collector.output.key}-option-${option.value}`;
    checkbox.className = 'multi-select-checkbox';
    checkbox.value = option.value;

    const optionLabel = document.createElement('label');
    optionLabel.htmlFor = checkbox.id;
    optionLabel.className = 'multi-select-option-label';
    optionLabel.textContent = option.label;

    // Handle checkbox change
    checkbox.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;

      if (target.checked) {
        // Add to selected values if not already there
        if (!selectedValues.includes(value)) {
          selectedValues.push(value);
        }
      } else {
        // Remove from selected values
        const index = selectedValues.indexOf(value);
        if (index !== -1) {
          selectedValues.splice(index, 1);
        }
      }

      updateSelectionDisplay();
      updateSelection();
    });

    optionWrapper.appendChild(checkbox);
    optionWrapper.appendChild(optionLabel);
    dropdown.appendChild(optionWrapper);
  });

  // Toggle dropdown visibility when clicking the button
  dropdownButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  // Prevent dropdown from closing when clicking inside it
  dropdown.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // Add a "Done" button at the bottom of the dropdown
  const doneButton = document.createElement('button');
  doneButton.type = 'button';
  doneButton.className = 'multi-select-done-button';
  doneButton.textContent = 'Apply';
  doneButton.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  dropdown.appendChild(doneButton);

  // Append elements to container and form
  containerDiv.appendChild(dropdownButton);
  containerDiv.appendChild(dropdown);
  formEl.appendChild(containerDiv);

  // Add styling
  const style = document.createElement('style');
  style.textContent = `
    .multi-select-container {
      position: relative;
      margin-bottom: 15px;
    }

    .multi-select-label {
      display: block;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .multi-select-button {
      width: 100%;
      padding: 8px 12px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      text-align: left;
      cursor: pointer;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .multi-select-button:after {
      content: '▼';
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }

    .multi-select-dropdown {
      position: absolute;
      width: 100%;
      max-height: 250px;
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 100;
      box-sizing: border-box;
    }

    .multi-select-option-wrapper {
      padding: 8px 12px;
      display: flex;
      align-items: center;
    }

    .multi-select-option-wrapper:hover {
      background-color: #f5f5f5;
    }

    .multi-select-checkbox {
      margin-right: 8px;
    }

    .multi-select-option-label {
      cursor: pointer;
      flex-grow: 1;
    }

    .multi-select-done-button {
      width: 100%;
      padding: 8px;
      background-color: #f0f0f0;
      border: none;
      border-top: 1px solid #ccc;
      cursor: pointer;
      font-weight: bold;
    }

    .multi-select-done-button:hover {
      background-color: #e8e8e8;
    }
  `;
  document.head.appendChild(style);
}
