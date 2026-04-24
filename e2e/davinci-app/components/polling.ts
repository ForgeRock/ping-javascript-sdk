/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  InternalErrorResponse,
  NodeStates,
  PollingCollector,
  Poller,
} from '@forgerock/davinci-client/types';

function isInternalErrorResponse(
  value: NodeStates | InternalErrorResponse,
): value is InternalErrorResponse {
  return 'type' in value && value.type === 'internal_error';
}

export default function pollingComponent(
  formEl: HTMLFormElement,
  collector: PollingCollector,
  poll: Poller,
  onNode: (node: NodeStates) => void,
) {
  const button = document.createElement('button');
  button.type = 'button';
  button.value = collector.output.key;
  button.textContent = 'Start polling';
  formEl.appendChild(button);

  const controller = new AbortController();

  button.onclick = async () => {
    button.disabled = true;

    const status = document.createElement('p');
    status.textContent = 'Polling...';
    formEl.appendChild(status);

    const result = await poll({ signal: controller.signal });

    if (isInternalErrorResponse(result)) {
      console.error(result.error?.message);
      const errEl = document.createElement('p');
      errEl.textContent = 'Polling error: ' + result.error?.message;
      formEl.appendChild(errEl);
      button.disabled = false;
      return;
    }

    onNode(result);
  };
}
