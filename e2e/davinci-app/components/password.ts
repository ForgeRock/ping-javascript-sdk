/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  PasswordCollector,
  ValidatedPasswordCollector,
  Updater,
  Validator,
} from '@forgerock/davinci-client/types';
import { dotToCamelCase } from '../helper.js';

const UPPERCASE_RE = /^[A-Z]+$/;
const LOWERCASE_RE = /^[a-z]+$/;
const DIGIT_RE = /^[0-9]+$/;

export default function passwordComponent(
  formEl: HTMLFormElement,
  collector: PasswordCollector | ValidatedPasswordCollector,
  updater: Updater<PasswordCollector | ValidatedPasswordCollector>,
  validator?: Validator,
) {
  const collectorKey = dotToCamelCase(collector.output.key);
  const label = document.createElement('label');
  const input = document.createElement('input');

  label.htmlFor = collectorKey;
  label.innerText = collector.output.label;
  input.type = 'password';
  input.id = collectorKey;
  input.name = collectorKey;

  formEl?.appendChild(label);
  formEl?.appendChild(input);

  if (collector.type === 'ValidatedPasswordCollector') {
    const passwordPolicy = collector.output.passwordPolicy;
    const requirementsList = document.createElement('ul');
    requirementsList.className = 'password-requirements';

    if (passwordPolicy.length) {
      const { min, max } = passwordPolicy.length;
      let lengthMessage: string | null = null;
      if (min != null && max != null) {
        lengthMessage = `${min}–${max} characters`;
      } else if (min != null) {
        lengthMessage = `At least ${min} characters`;
      } else if (max != null) {
        lengthMessage = `At most ${max} characters`;
      }
      if (lengthMessage) {
        const li = document.createElement('li');
        li.textContent = lengthMessage;
        requirementsList.appendChild(li);
      }
    }

    if (passwordPolicy.minCharacters) {
      for (const [charset, count] of Object.entries(passwordPolicy.minCharacters)) {
        const li = document.createElement('li');
        if (UPPERCASE_RE.test(charset)) {
          li.textContent = `At least ${count} uppercase letter(s)`;
        } else if (LOWERCASE_RE.test(charset)) {
          li.textContent = `At least ${count} lowercase letter(s)`;
        } else if (DIGIT_RE.test(charset)) {
          li.textContent = `At least ${count} number(s)`;
        } else {
          li.textContent = `At least ${count} special character(s)`;
        }
        requirementsList.appendChild(li);
      }
    }

    if (requirementsList.children.length > 0) {
      formEl?.appendChild(requirementsList);
    }
  }

  const inputEl = formEl?.querySelector(`#${collectorKey}`);
  const shouldValidate = collector.type === 'ValidatedPasswordCollector' && !!validator;

  inputEl?.addEventListener('input', (event: Event) => {
    const value = (event.target as HTMLInputElement).value;

    if (shouldValidate) {
      const result = validator(value);
      if (Array.isArray(result) && result.length) {
        let errorEl = formEl?.querySelector<HTMLUListElement>(`.${collectorKey}-error`);
        if (!errorEl) {
          errorEl = document.createElement('ul');
          errorEl.className = `${collectorKey}-error`;
          inputEl.after(errorEl);
        }
        const items = result.map((msg) => {
          const li = document.createElement('li');
          li.textContent = msg;
          return li;
        });
        errorEl.replaceChildren(...items);
        return;
      }
      formEl?.querySelector(`.${collectorKey}-error`)?.remove();
    }

    const error = updater(value);
    if (error && 'error' in error) {
      console.error(error.error.message);
    }
  });
}
