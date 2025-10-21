/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { NameCallback } from '@forgerock/journey-client/types';

export default function textComponent(
  formEl: HTMLFormElement,
  callback: NameCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const label = document.createElement('label');
  const input = document.createElement('input');

  label.htmlFor = collectorKey;
  label.innerText = callback.getPrompt();
  input.type = 'text';
  input.id = collectorKey;
  input.name = collectorKey;

  formEl?.appendChild(label);
  formEl?.appendChild(input);

  formEl?.querySelector(`#${collectorKey}`)?.addEventListener('input', (event) => {
    callback.setName((event.target as HTMLInputElement).value);
  });
}
