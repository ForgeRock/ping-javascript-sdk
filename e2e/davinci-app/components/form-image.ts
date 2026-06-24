/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ImageCollector } from '@forgerock/davinci-client/types';

export default function (formEl: HTMLFormElement, collector: ImageCollector) {
  if (collector.error) {
    const errorEl = document.createElement('p');
    errorEl.innerText = `Image error: ${collector.error}`;
    formEl.appendChild(errorEl);
    return;
  }

  const container = document.createElement('div');

  const img = document.createElement('img');
  img.src = collector.output.src;
  img.alt = collector.output.alt;
  img.setAttribute('data-testid', 'form-image');

  if (collector.output.href) {
    const anchor = document.createElement('a');
    anchor.href = collector.output.href;
    anchor.appendChild(img);
    container.appendChild(anchor);
  } else {
    container.appendChild(img);
  }

  formEl.appendChild(container);
}
