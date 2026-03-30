/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import {
  PollingCollector,
  PollingStatus,
  InternalErrorResponse,
  Updater,
} from '@forgerock/davinci-client/types';

export default function pollingComponent(
  formEl: HTMLFormElement,
  collector: PollingCollector,
  poll: (collector: PollingCollector) => Promise<PollingStatus | InternalErrorResponse>,
  updater: Updater<PollingCollector>,
  submitForm: () => Promise<void>,
) {
  const button = document.createElement('button');
  button.type = 'button';
  button.value = collector.output.key;
  button.innerHTML = 'Start polling';
  formEl.appendChild(button);

  button.onclick = async () => {
    const p = document.createElement('p');
    p.innerText = 'Polling...';
    formEl?.appendChild(p);

    const status = await poll(collector);
    if (typeof status !== 'string' && 'error' in status) {
      console.error(status.error.message);
      return;
    }

    const result = updater(status);
    if (result && 'error' in result) {
      console.error(result.error.message);
      return;
    }

    const resultEl = document.createElement('p');
    resultEl.innerText = 'Polling result: ' + JSON.stringify(status, null, 2);
    formEl?.appendChild(resultEl);

    await submitForm();
  };
}
