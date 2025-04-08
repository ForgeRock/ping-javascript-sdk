/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { SubmitCollector } from '@forgerock/davinci-client/types';

export default function submitButtonComponent(formEl: HTMLFormElement, collector: SubmitCollector) {
  const button = document.createElement('button');

  button.type = 'submit';
  button.innerText = collector.output.label;

  formEl?.appendChild(button);
}
