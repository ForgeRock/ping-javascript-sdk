/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { TermsAndConditionsCallback } from '@forgerock/journey-client/types';

export default function termsAndConditionsComponent(
  journeyEl: HTMLDivElement,
  callback: TermsAndConditionsCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const label = document.createElement('label');
  const checkbox = document.createElement('input');

  // Terms text area
  console.log(callback.getTerms);

  // Checkbox for acceptance
  checkbox.type = 'checkbox';
  checkbox.id = collectorKey;
  checkbox.required = true;

  label.htmlFor = collectorKey;
  label.innerText = ' I accept the terms and conditions';

  journeyEl.appendChild(label);
  journeyEl.appendChild(checkbox);

  checkbox.addEventListener('change', (event) => {
    const accepted = (event.target as HTMLInputElement).checked;
    callback.setAccepted(accepted);
  });
}
