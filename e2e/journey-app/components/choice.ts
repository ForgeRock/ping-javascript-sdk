/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ChoiceCallback } from '@forgerock/journey-client/types';

export default function choiceComponent(
  journeyEl: HTMLDivElement,
  callback: ChoiceCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const label = document.createElement('label');
  const select = document.createElement('select');

  label.htmlFor = collectorKey;
  label.innerText = callback.getPrompt();
  select.id = collectorKey;
  select.name = collectorKey;

  // Add choices as options
  const choices = callback.getChoices();
  const defaultChoice = callback.getDefaultChoice();

  choices.forEach((choice, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.text = choice;
    option.selected = index === defaultChoice;
    select.appendChild(option);
  });

  journeyEl?.appendChild(label);
  journeyEl?.appendChild(select);

  journeyEl?.querySelector(`#${collectorKey}`)?.addEventListener('change', (event) => {
    const selectedIndex = Number((event.target as HTMLSelectElement).value);
    callback.setChoiceIndex(selectedIndex);
  });
}
