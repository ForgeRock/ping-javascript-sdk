import type { SocialLoginCollector } from '@forgerock/davinci-client/types';

export default function submitButtonComponent(
  formEl: HTMLFormElement,
  collector: SocialLoginCollector,
) {
  const button = document.createElement('button');

  button.value = collector.output.label;
  button.innerHTML = collector.output.label;
  button.onclick = () => {
    if (collector.output.url) {
      window.location.assign(collector.output?.url);
    } else {
      console.error('url is null, nothing happening');
    }
  };

  formEl?.appendChild(button);
}
