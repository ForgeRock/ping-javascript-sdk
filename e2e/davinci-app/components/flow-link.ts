/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { FlowCollector, InitFlow } from '@forgerock/davinci-client/types';

export default function flowLinkComponent(
  formEl: HTMLFormElement,
  collector: FlowCollector,
  flow: InitFlow,
  renderForm: () => void,
) {
  const button = document.createElement('button');

  button.classList.add('flow-link');
  button.type = 'button';
  button.name = collector.output.label || 'no-label-provided-err';
  button.innerText = collector.output.label;

  formEl?.appendChild(button);

  button.addEventListener('click', async () => {
    const node = await flow();
    if (node.error) {
      console.error(node.error.message);
    }
    renderForm();
  });
}
