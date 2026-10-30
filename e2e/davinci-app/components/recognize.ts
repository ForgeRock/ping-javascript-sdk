/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { recognize } from '@forgerock/recognize';

import type {
  RecognizeCollector,
  RecognizeInputValue,
  Updater,
} from '@forgerock/davinci-client/types';

export default function recognizeComponent(
  formEl: HTMLFormElement,
  collector: RecognizeCollector,
  updater: Updater<RecognizeCollector>,
  submitForm: () => Promise<void>,
) {
  const config = collector.output.config;
  const container = document.createElement('div');
  container.id = `recognize-${collector.id}`;
  formEl.appendChild(container);

  const client = recognize({
    serviceURL: config.serviceURL,
    customer: config.customerName,
    transactionData: config.transactionData,
    authorizationToken: config.webSDKOptions.authorizationToken,
    operationID: config.webSDKOptions.operationId,
    disableSteps: ['done', 'error'],
  });

  client.subscribe({
    next: ({ type, ...rest }) => {
      console.log('[recognize]', type, rest);
    },
    error: (err) => {
      console.error('[recognize] error', err.error);
      updater(err);
      submitForm();
    },
    complete: (detail) => {
      console.log('[recognize] complete', detail);
      const value: RecognizeInputValue = { transactionJWT: detail.jwt ?? '' };
      updater(value);
      submitForm();
    },
  });

  const sessionType = config.action === 'ENROLL' ? 'enroll' : 'auth';
  console.log(`[recognize] session type: ${sessionType} (action: ${config.action})`);

  client
    .init({
      mode: 'mount',
      container,
      type: sessionType,
      username: config.username,
    })
    .then((err) => {
      if (err) {
        console.error('[recognize] init error', err);
        updater(err);
      }
    });
}
