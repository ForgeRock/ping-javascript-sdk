import type {
  TextCollector,
  ValidatedTextCollector,
  Updater,
  Validator,
} from '@forgerock/davinci-client/types';
import { dotToCamelCase } from '../helper.js';

export default function textComponent(
  formEl: HTMLFormElement,
  collector: TextCollector | ValidatedTextCollector,
  updater: Updater,
  validator: Validator,
) {
  const collectorKey = dotToCamelCase(collector.output.key);
  const label = document.createElement('label');
  const input = document.createElement('input');

  label.htmlFor = collectorKey;
  label.innerText = collector.output.label;
  input.type = 'text';
  input.id = collectorKey;
  input.name = collectorKey;

  formEl?.appendChild(label);
  formEl?.appendChild(input);

  if (collector.category === 'ValidatedSingleValueCollector') {
    formEl?.querySelector(`#${collectorKey}`)?.addEventListener('input', (event) => {
      const result = validator((event.target as HTMLInputElement).value);
      const errorEl = formEl?.querySelector(`.${collectorKey}-error`);

      if (Array.isArray(result) && result.length && !errorEl) {
        const errorEl = document.createElement('div');
        errorEl.className = `${collectorKey}-error`;
        errorEl.innerText = result.join(', ');
        formEl?.querySelector(`#${collectorKey}`)?.after(errorEl);
      } else if (Array.isArray(result) && result.length) {
        return;
      } else {
        formEl.querySelector(`.${collectorKey}-error`)?.remove();
        const error = updater((event.target as HTMLInputElement).value);
        if (error && 'error' in error) {
          console.error(error.error.message);
        }
      }
    });
  } else {
    formEl?.querySelector(`#${collectorKey}`)?.addEventListener('input', (event) => {
      const error = updater((event.target as HTMLInputElement).value);
      if (error && 'error' in error) {
        console.error(error.error.message);
      }
    });
  }
}
