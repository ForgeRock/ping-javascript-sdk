/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { SelectIdPCallback } from '@forgerock/journey-client/types';

export default function selectIdpComponent(
  journeyEl: HTMLDivElement,
  callback: SelectIdPCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const container = document.createElement('div');
  const label = document.createElement('label');

  container.id = collectorKey;
  label.innerText = 'Select Identity Provider:';

  const providers = callback.getProviders();

  // Create select element for provider selection
  const select = document.createElement('select');
  select.id = collectorKey;
  select.name = collectorKey;

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.innerText = 'Choose a provider...';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  // Create option elements for each provider
  providers.forEach((provider) => {
    const option = document.createElement('option');
    option.value = provider.provider;
    option.innerText = provider.provider;
    select.appendChild(option);
  });

  container.appendChild(select);

  journeyEl?.appendChild(label);
  journeyEl?.appendChild(container);

  // Add event listener for provider selection
  select.addEventListener('change', (event) => {
    const selectedProvider = (event.target as HTMLSelectElement).value;
    if (selectedProvider) {
      callback.setProvider(selectedProvider);
    }
  });
}
