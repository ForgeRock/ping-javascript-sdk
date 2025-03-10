import type {
  TextCollector,
  ValidatedTextCollector,
  Updater,
} from '@forgerock/davinci-client/types';
import { dotToCamelCase } from '../helper.js';

export default function usernameComponent(
  formEl: HTMLFormElement,
  collector: TextCollector | ValidatedTextCollector,
  updater: Updater,
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

  formEl?.querySelector(`#${collectorKey}`)?.addEventListener('input', (event) => {
    const error = updater((event.target as HTMLInputElement).value);
    if (error && 'error' in error) {
      console.error(error.error.message);
    }
  });
}
