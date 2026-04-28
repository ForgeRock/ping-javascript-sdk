/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { AgreementCollector } from '@forgerock/davinci-client/types';

export default function (formEl: HTMLFormElement, collector: AgreementCollector) {
  const output = collector.output;
  const componentEnabled = output.enabled;

  if (!componentEnabled) {
    return;
  }

  const content = output.label;
  const titleEnabled = output.titleEnabled;
  const title = output.title;

  if (titleEnabled) {
    const titleEl = document.createElement('h3');
    titleEl.innerText = title;
    formEl?.appendChild(titleEl);
  }

  const agreement = document.createElement('p');
  agreement.innerText = content;
  formEl?.appendChild(agreement);
}
