import type { SocialLoginCollector } from '@forgerock/davinci-client/types';

export default function submitButtonComponent(
  formEl: HTMLFormElement,
  collector: SocialLoginCollector,
  updater: () => void,
) {
  const button = document.createElement('button');
  console.log('collector', collector);
  button.value = collector.output.label;
  button.innerHTML = collector.output.label;
  button.onclick = () => updater();

  formEl?.appendChild(button);
}
