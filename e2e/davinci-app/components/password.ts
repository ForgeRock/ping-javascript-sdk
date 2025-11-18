/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PasswordCollector, Updater } from '@forgerock/davinci-client/types';
import { dotToCamelCase } from '../helper.js';

export default function passwordComponent(
  formEl: HTMLFormElement,
  collector: PasswordCollector,
  updater: Updater<PasswordCollector>,
) {
  const label = document.createElement('label');
  const input = document.createElement('input');

  label.htmlFor = dotToCamelCase(collector.output.key);
  label.innerText = collector.output.label;
  input.type = 'password';
  input.id = dotToCamelCase(collector.output.key);
  input.name = dotToCamelCase(collector.output.key);

  formEl?.appendChild(label);
  formEl?.appendChild(input);

  formEl
    ?.querySelector(`#${dotToCamelCase(collector.output.key)}`)
    ?.addEventListener('blur', (event: Event) => {
      const error = updater((event.target as HTMLInputElement).value);
      if (error && 'error' in error) {
        console.error(error.error.message);
      }
    });
}
