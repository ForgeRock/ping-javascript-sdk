/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ConfirmationCallback } from '@forgerock/journey-client/types';

export default function confirmationComponent(
  journeyEl: HTMLDivElement,
  callback: ConfirmationCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const label = document.createElement('label');
  const container = document.createElement('div');

  label.innerText = callback.getPrompt();
  container.id = collectorKey;

  // Get options and default option
  const options = callback.getOptions();
  const defaultOption = callback.getDefaultOption();

  // Create radio buttons for each option
  options.forEach((option: string, index: number) => {
    const radioContainer = document.createElement('div');
    const radio = document.createElement('input');
    const radioLabel = document.createElement('label');

    radio.type = 'radio';
    radio.id = `${collectorKey}-${index}`;
    radio.name = collectorKey;
    radio.value = String(index);
    radio.checked = index === defaultOption;

    radioLabel.htmlFor = `${collectorKey}-${index}`;
    radioLabel.innerText = option;

    radioContainer.appendChild(radio);
    radioContainer.appendChild(radioLabel);
    container.appendChild(radioContainer);
  });

  journeyEl?.appendChild(label);
  journeyEl?.appendChild(container);

  // Add event listener for radio button changes
  journeyEl?.querySelectorAll(`input[name="${collectorKey}"]`)?.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      if ((event.target as HTMLInputElement).checked) {
        const selectedIndex = Number((event.target as HTMLInputElement).value);
        callback.setOptionIndex(selectedIndex);
      }
    });
  });
}
