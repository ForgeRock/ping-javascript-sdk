/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PasswordCallback } from '@forgerock/journey-client/types';

export default function passwordComponent(
  journeyEl: HTMLDivElement,
  callback: PasswordCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const label = document.createElement('label');
  const input = document.createElement('input');

  label.htmlFor = collectorKey;
  label.innerText = callback.getPrompt();
  input.type = 'password';
  input.id = collectorKey;
  input.name = collectorKey;

  journeyEl?.appendChild(label);
  journeyEl?.appendChild(input);

  journeyEl?.querySelector(`#${collectorKey}`)?.addEventListener('input', (event) => {
    callback.setPassword((event.target as HTMLInputElement).value);
  });
}
