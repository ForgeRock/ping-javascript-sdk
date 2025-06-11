/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { IdpCollector } from '@forgerock/davinci-client/types';
import { InternalErrorResponse } from 'packages/davinci-client/src/lib/client.types.js';

export default function submitButtonComponent(
  formEl: HTMLFormElement,
  collector: IdpCollector,
  updater: () => Promise<void | InternalErrorResponse>,
) {
  const button = document.createElement('button');
  console.log('collector', collector);
  button.value = collector.output.label;
  button.innerHTML = collector.output.label;
  button.onclick = async () => {
    await updater();
    if ('url' in collector.output && typeof collector.output.url === 'string') {
      window.location.assign(collector.output.url);
    } else {
      console.error('no url to continue from');
    }
  };

  formEl?.appendChild(button);
}
