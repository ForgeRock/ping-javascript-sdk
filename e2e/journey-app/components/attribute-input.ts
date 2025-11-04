/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { AttributeInputCallback } from '@forgerock/journey-client/types';

export default function attributeInputComponent(
  journeyEl: HTMLDivElement,
  callback: AttributeInputCallback<string | number | boolean>,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const label = document.createElement('label');
  const input = document.createElement('input');

  label.htmlFor = collectorKey;
  label.innerText = callback.getPrompt();

  // Determine input type based on attribute type
  const attributeType = callback.getType();
  if (attributeType === 'BooleanAttributeInputCallback') {
    input.type = 'checkbox';
    input.checked = (callback.getInputValue() as boolean) || false;
  } else if (attributeType === 'NumberAttributeInputCallback') {
    input.type = 'number';
    input.value = String(callback.getInputValue() || '');
  } else {
    input.type = 'text';
    input.value = String(callback.getInputValue() || '');
  }

  input.id = collectorKey;
  input.name = collectorKey;
  input.required = callback.isRequired();

  journeyEl?.appendChild(label);
  journeyEl?.appendChild(input);

  journeyEl?.querySelector(`#${collectorKey}`)?.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (attributeType === 'BooleanAttributeInputCallback') {
      callback.setInputValue(target.checked);
    } else if (attributeType === 'NumberAttributeInputCallback') {
      callback.setInputValue(Number(target.value));
    } else {
      callback.setInputValue(target.value);
    }
  });
}
